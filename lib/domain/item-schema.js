var loopback = require('loopback');
var Q = require('q');
var traverse = require('traverse');

var config = require('../support/config');
var logger = require('../support/logger');

var indexes = require('./indexes');
var models = require('./models');
var Relations = require('./relations');

var JsonSchemaValidator = require('./json-schema-validator');
var Links = require('./links');
var modelPropertiesConverter = require('./model-properties-converter');
var readOnlyDefaultValuesHandler = require('./readonly-default-values-handler');

var itemSchemaProperties = {
    collectionName: {type: 'string', required: true, id: true, generated: false}
};

var relationSchema = require('./relation-schema');
var ItemSchema = module.exports = config.Model.extend('item-schemas', itemSchemaProperties);

// fill in loopbackJsonSchema.init
ItemSchema.app = null;

ItemSchema.prototype.allLinks = function() {
    var links = new Links(this.defaultLinks(), this.relationLinks(), this.links);
    return links.all();
};

ItemSchema.validate('relations', function customValidator(err) {
    if (!this.relations) {
        return;
    }

    var validator = new JsonSchemaValidator(relationSchema.$schema);
    var validationResult = validator.validate(relationSchema, this);

    var errors = validationResult.items;
    for (var error in errors) {
        this.errors.add(errors[error].property, errors[error].message, errors[error].code);
    }

    if (Object.keys(this.errors.codes).length > 0) {
        err();
    }
}, { message: 'relations is invalid' });

ItemSchema.prototype.customLinks = function() {
    var links = new Links(this.defaultLinks(), this.relationLinks(), this.links);
    return links.custom();
};

ItemSchema.prototype.relationLinks = function() {
    var relationKey, relationLinks = [], relation;
    if (this.relations) {
        for (relationKey in this.relations) {
            relation = this.relations[relationKey];

            if (relation.type == 'belongsTo') {
                relationLinks.push({ rel: relationKey, href: '/'+relation.collectionName+'/{'+relation.foreignKey+'}'});
            } else {
                relationLinks.push({ rel: relationKey, href: '/'+this.collectionName+'/{id}/'+relationKey });
            }
        }
    }

    return relationLinks;
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
        { rel: 'delete', method: 'DELETE', href: itemUrlTemplate },
        { rel: 'parent', href: collectionUrl }
    ];
};

ItemSchema.prototype.url = function() {
    return ItemSchema.urlForCollectionName(this.collectionName);
};

ItemSchema.urlForCollectionName = function urlForCollectionName (collectionName) {
    return '/' + ItemSchema.pluralModelName + '/' + collectionName;
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
        this.$schema = 'http://json-schema.org/draft-04/hyper-schema#';
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
        this.collectionName,
        modelProperties.call(this),
        { plural: this.collectionName, indexes: indexes }
    );

    model.cachedItemSchema = this;
    addJsonSchemaValidation.call(this, model);
    model.attachTo(ItemSchema.dataSource);

    return model;
};

ItemSchema.prototype.createIndexes = function(callback) {
    indexes.create(this.getDataSource(), this.collectionName, callback);
};

ItemSchema.prototype.model = function() {
    return loopback.findModel(this.collectionName) || null;
};

ItemSchema.prototype.collectionSchema = function() {
    return new config.CollectionSchemaClass(this);
};

ItemSchema.findByCollectionName = function(collectionName, callback) {
    ItemSchema.findOne({ where: { collectionName: collectionName }}, function(err, jsonSchema) {
        if (err) {
            logger.error('Error fetching JSON Schema for collectionName:', collectionName, 'Error:', err);
        } else if (jsonSchema === null) {
            logger.warn('JSON Schema for collectionName', collectionName, 'not found.');
        }
        callback(err, jsonSchema);
    });
};

ItemSchema.preLoadedModels = false;

ItemSchema.preLoadModels = function(currentAttemptNumber) {
    if (currentAttemptNumber === undefined) {
        currentAttemptNumber = 0;
    }

    var registerModel = function(schema, model) {
        var deferred = Q.defer();
        var collectionName = schema.collectionName;

        schema.registerModel(model, function(err) {
            if (err) {
                logger.error('Failed to register model '+collectionName+': ' + err);
            } else {
                logger.debug('registered model: '+collectionName);
            }
            deferred.resolve();
        });

        return deferred;
    };

    ItemSchema.find({}, function(err, itemSchemas) {
        if (err) {
            if (currentAttemptNumber >= config.registerItemSchemaMaxAttempts) {
                ItemSchema.app.emit('loadModels', err);
            } else {
                logger.error('Attempt: '+currentAttemptNumber+', find all itemschemas error: ' + err.message);

                setTimeout(function() {
                    ItemSchema.preLoadModels(currentAttemptNumber + 1);
                }, config.registerItemSchemaAttemptDelay);
            }

            return;
        }

        var mapModels = {};

        itemSchemas.forEach(function(itemSchema) {
            var model = itemSchema.constructModel();

            mapModels[itemSchema.collectionName] = model;
            ItemSchema.attachModel(model);
        });

        var promisses = [];
        itemSchemas.forEach(function(schema) {
            promisses.push(registerModel(schema, mapModels[schema.collectionName]));
        });

        Q.allSettled(promisses).done(function() {
            logger.info('Pre loaded all models');
            ItemSchema.preLoadedModels = true;
            ItemSchema.app.emit('loadModels', null);
        });
    });
};

ItemSchema.prototype.associateModel = function(model, callback) {
    Relations.getInstance().bindRelation(this, model);
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

ItemSchema.observe('after save', function afterSave(ctx, next) {
    var schema = ctx.instance;
    modelPropertiesConverter.restore(schema);

    var model = schema.constructModel();
    ItemSchema.attachModel(model);

    schema.registerModel(model, function(err) {
        if (err) {
            logger.error('Failed to register model '+ schema.collectionName+': ' + err);
        } else {
            logger.debug('registered model: '+schema.collectionName);
        }
        schema.links = schema.allLinks();
    });

    schema.createIndexes(function(err) {
        next(err);
    });
});

ItemSchema.defaultRemoteHookInitializers = [
    includeBodyFieldInjector
];

ItemSchema.remoteHookInitializers = [];

ItemSchema.defineRemoteHooks = function(model) {
    logger.debug('Defining remote hooks for ' + model.modelName);

    var hooksInitializers = ItemSchema.remoteHookInitializers;

    for (var i=0; i<hooksInitializers.length; i++) {
        logger.debug('Defining remote hook ' + hooksInitializers[i].name);
        hooksInitializers[i].call(null, model);
    }
};

ItemSchema.registerRemoteHookInitializers = function(hooks) {
    if (hooks instanceof Array) {
        ItemSchema.remoteHookInitializers = ItemSchema.remoteHookInitializers.concat(hooks);
    } else {
        ItemSchema.remoteHookInitializers.push(hooks);
    }
 };

function addJsonSchemaValidation(modelClass) {
    var itemSchema = this;
    modelClass.validate('_all', function customValidator(err) {
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
    var properties = traverse(this.properties).map(function(property) {
        if (this.node) {
            delete this.node.required;
        }

        type = traverse(property).get(['type']);
        if (type === 'array') {
            this.remove();
        }
        if (type === 'integer') {
            this.node.type = 'number';
        }
    });

    if (!config.generatedId && properties) {
        properties.id = {type: 'string', generated: false, id: true};
    }

    return properties;
}

function includeBodyFieldInjector (model) {
    logger.debug('include field body injector for model: ', model.modelName);
    model.beforeRemote('**', function(ctx, user, next) {
        readOnlyDefaultValuesHandler(ctx);
        next();
    });
}
