var debug = require('debug')('json-schema');
var loopback = require('loopback');
var Q = require('q');
var traverse = require('traverse');
var _ = require('underscore');

var config = require('../support/config');
var logger = require('../support/logger');

var JsonSchemaValidator = require('./json-schema-validator');
var Links = require('./links');
var readOnlyDefaultValuesHandler = require('./readonly-default-values-handler');
var modelPropertiesConverter = require('./model-properties-converter');

var ItemSchema = module.exports = config.Model.extend('item-schema', { "resourceId": { "type": "Number", "generated": true, "id": true } });

// fill in loopbackJsonSchema.init
ItemSchema.app = null;

ItemSchema.prototype.allLinks = function() {
    var links = new Links(this.defaultLinks(), this.links);
    return links.all();
};

ItemSchema.prototype.customLinks = function() {
    var links = new Links(this.defaultLinks(), this.links);
    return links.custom();
};

ItemSchema.prototype.defaultLinks = function() {
    var itemUrlTemplate = this.itemUrlTemplate();
    var collectionUrl = this.collectionUrl();
    var schemaUrl = this.url();
    return [
        { rel: 'self', href: itemUrlTemplate },
        { rel: 'item', href: itemUrlTemplate },
        { rel: 'create', method: 'POST', href: collectionUrl, schema: { $ref: schemaUrl } },
        { rel: 'update', method: 'PUT', href: itemUrlTemplate },
        { rel: 'delete', method: 'DELETE', href: itemUrlTemplate }
    ];
};

ItemSchema.prototype.url = function() {
    var path = '/' + this.constructor.pluralModelName + '/' + this.resourceId;
    return path;
};

ItemSchema.prototype.itemUrlTemplate = function() {
    return this.collectionUrl() + '/{id}';
};

ItemSchema.prototype.collectionUrl = function() {
    var path = '/' + this.collectionName;
    return path;
};

ItemSchema.prototype.update$schema = function() {
    if (!this.$schema) {
        this.$schema = "http://json-schema.org/draft-04/hyper-schema#";
    }
};

ItemSchema.prototype.beforeRegisterLoopbackModel = function(app, JsonSchemaModel, callback) {
    logger.debug('Entered beforeRegisterLoopbackModel');

    if (ItemSchema.app._registeredLoopbackHooks[JsonSchemaModel.modelName]) {
        logger.debug('Loopback model name: '+JsonSchemaModel.modelName+' is already registered');
    } else {
        ItemSchema.defineRemoteHooks(JsonSchemaModel);
        ItemSchema.app._registeredLoopbackHooks[JsonSchemaModel.modelName] = true;
    }

    callback();
};

ItemSchema.prototype.constructModel = function() {
    var indexes = this.indexes || {};
    var model = config.Model.extend(
        this.modelName,
        modelProperties.call(this),
        { plural: this.collectionName, indexes: indexes }
    );

    addJsonSchemaValidation.call(this, model);
    model.attachTo(ItemSchema.dataSource);

    return model;
};

ItemSchema.prototype.createIndexes = function(callback) {
    var dataSource = this.getDataSource();

    if (dataSource.connector && dataSource.connector.autoupdate) {
        logger.info('Start creating indexes dynamically.');

        dataSource.connector.autoupdate([this.modelName], function ensureIndexCallback(err) {
            if (err) {
                return callback(err);
            }

            logger.info('Ensured dinamic index.');
            callback(null, true);
        });
    } else {
        callback(null, false);
    }
};

ItemSchema.prototype.model = function() {
    return loopback.findModel(this.modelName) || null;
};

ItemSchema.prototype.collectionSchema = function() {
    return new config.CollectionSchemaClass(this);
};

ItemSchema.findByCollectionName = function(collectionName, callback) {
    ItemSchema.findOne({ where: { collectionName: collectionName }}, function(err, jsonSchema) {
        if (err) {
            logger.error("Error fetching JSON Schema for collectionName:", collectionName, "Error:", err);
        } else if (jsonSchema === null) {
            logger.warn("JSON Schema for collectionName", collectionName, "not found.");
        }
        callback(err, jsonSchema);
    });
};

ItemSchema.preLoadModels = function() {
    var registerModel = function(schema, model) {
        var deferred = Q.defer();
        var modelName = schema.modelName;

        schema.registerModel(model, function(err) {
            if (err) {
                logger.error('Failed to register model '+modelName+': ' + err);
            } else {
                logger.debug('registered model: '+modelName);
            }
            deferred.resolve();
        });

        return deferred;
    };

    ItemSchema.find({}, function(err, itemSchemas) {
        if (err) {
            logger.error('Find all itemschemas error: ' + err.message);
            return;
        }

        var mapModels = {};

        itemSchemas.forEach(function(itemSchema) {
            var model = itemSchema.constructModel();

            mapModels[itemSchema.modelName] = model;
            ItemSchema.attachModel(model);
        });

        var promisses = [];
        itemSchemas.forEach(function(schema) {
            promisses.push(registerModel(schema, mapModels[schema.modelName]));
        });

        Q.allSettled(promisses).done(function() {
            logger.info('Pre loaded all models');
            ItemSchema.app.emit('loadModels');
        });
    });
};

ItemSchema.prototype.associateModel = function(model, callback) {
    callback();
};

ItemSchema.prototype.registerModel = function(model, callback) {
    var schema = this;
    this.beforeRegisterLoopbackModel(ItemSchema.app, model, function(err) {
        if (err) { return callback(err); }

        schema.associateModel(model, function(err) {
            if (err) { return callback(err); }
            ItemSchema.app.model(model);
            callback(null);
        });

    });
};

ItemSchema.attachModel = function(model) {
    model.attachTo(ItemSchema.dataSource);
};

ItemSchema.afterInitialize = function() {
    modelPropertiesConverter.restore(this);
    this.links = this.allLinks();
};

ItemSchema.beforeSave = function(next, data) {
    this.update$schema();
    this.links = this.customLinks();
    modelPropertiesConverter.convert(data);
    next();
};

ItemSchema.afterSave = function(done) {
    var self = this;
    modelPropertiesConverter.restore(this);

    var model = this.constructModel();
    ItemSchema.attachModel(model);

    this.registerModel(model, function(err) {
        if (err) {
            logger.error('Failed to register model '+ self.modelName+': ' + err);
        } else {
            logger.debug('registered model: '+self.modelName);
        }
        self.links = self.allLinks();
    });

    this.createIndexes(function (err, created) {
        done(err);
    });
};

ItemSchema.defineRemoteHooks = function(model) {
    logger.debug('Defining remote hooks for ' + model.modelName);

    includeBodyFieldInjector(model);
};

function addJsonSchemaValidation(JsonSchemaModel) {
    var itemSchema = this;

    JsonSchemaModel.validate('_all', function customValidator(err) {
        var validator = new JsonSchemaValidator(itemSchema.$schema);
        var validationResult = validator.validate(itemSchema, this);

        var errors = validationResult.items;
        for (var error in errors) {
            this.errors.add(errors[error].property, errors[error].message, errors[error].code);
        }

        if (Object.keys(this.errors.codes).length > 0) {
            err();
        }
    }, { message: 'Instance is invalid' });
}

function modelProperties() {
    var type;
    return traverse(this.properties).map(function(property) {
        type = traverse(property).get(['type']);
        if (type === 'array') {
            this.remove();
        }
        if (type === 'integer') {
            this.node.type = 'number';
        }
    });
}

function includeBodyFieldInjector (model) {
    logger.debug('include field body injector for model: ', model.modelName);
    model.beforeRemote('create', function(ctx, user, next) {
        readOnlyDefaultValuesHandler(ctx.method.ctor.definition.rawProperties, ctx.req.body);
        next();
    });

    model.beforeRemote('prototype.updateAttributes', function(ctx, user, next) {
        readOnlyDefaultValuesHandler(ctx.method.ctor.definition.rawProperties, ctx.req.body);
        next();
    });
};
