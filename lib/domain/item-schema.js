var debug = require('debug')('json-schema');

var loopbackExplorer = require('loopback-explorer');

var config = require('../support/config');
var logger = require('../support/logger')
var Links = require('./links');
var modelPropertiesSanitizer = require('./model-properties-sanitizer');


var ItemSchema = module.exports = config.Model.extend('item-schema');


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
    var path = '/' + this.constructor.pluralModelName + '/' + this.id;
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

ItemSchema.prototype.registerLoopbackModel = function(app) {
    logger.debug('this:', this);
    logger.debug('this.modelName:', this.modelName);
    logger.debug('this.collectionName:', this.collectionName);

    var dataSource = ItemSchema.dataSource;
    var JsonSchemaModel = config.Model.extend(this.modelName, {}, { plural: this.collectionName });
    JsonSchemaModel.attachTo(dataSource);
    app.model(JsonSchemaModel);
    loopbackExplorer(app);
};

ItemSchema.prototype.collectionSchema = function() {
    return new config.CollectionSchemaClass(this);
};


ItemSchema.on('attached', function(app) {
    ItemSchema.afterInitialize = function() {
        modelPropertiesSanitizer.restore(this);
        this.links = this.allLinks();
    };

    ItemSchema.beforeSave = function(next) {
        this.update$schema();
        this.links = this.customLinks();
        modelPropertiesSanitizer.sanitize(this);
        next();
    };

    ItemSchema.afterSave = function(done) {
        modelPropertiesSanitizer.restore(this);
        this.registerLoopbackModel(app);
        this.links = this.allLinks();
        done();
    };
});
