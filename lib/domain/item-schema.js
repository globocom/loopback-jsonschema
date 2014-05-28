var debug = require('debug')('json-schema');

var loopback = require('loopback');
var loopbackExplorer = require('loopback-explorer');
var Model = require('loopback').Model;

var logger = require('../support/logger')
var Links = require('../domain/links');
var LJSRequest = require('../http/ljs-request');
var modelPropertiesSanitizer = require('../domain/model-properties-sanitizer');
var config = require('../support/config');

var ItemSchema = module.exports = Model.extend('item-schema');


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


ItemSchema.prototype.mergeDefaultCustomLinks = function() {
    var links = new Links(this.defaultLinks(), this.links);
    this.links = links.all();
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
    var JsonSchemaModel = ItemSchema.dataSource.createModel(this.modelName, {}, { plural: this.collectionName });
    app.model(JsonSchemaModel);
    loopbackExplorer(app);
};

ItemSchema.prototype.collectionSchema = function() {
    return new config.CollectionSchemaClass(this);
};


ItemSchema.on('attached', function(app) {
    ItemSchema.afterInitialize = function() {
        modelPropertiesSanitizer.restore(this);
        this.mergeDefaultCustomLinks();
    }

    ItemSchema.beforeSave = function(next) {
        this.update$schema();
        modelPropertiesSanitizer.sanitize(this);
        next();
    };

    ItemSchema.afterSave = function(done) {
        this.registerLoopbackModel(app);
        modelPropertiesSanitizer.restore(this);
        done();
    };
});
