var debug = require('debug')('json-schema');

var loopback = require('loopback');
var loopbackExplorer = require('loopback-explorer');
var Model = require('loopback').Model;

var logger = require('../support/logger')

var JsonSchemaLinks = require('./json-schema-links');
var LJSRequest = require('./ljs-request');
var modelPropertiesSanitizer = require('./model-properties-sanitizer');

var JsonSchema = module.exports = Model.extend('json-schema');


JsonSchema.findByCollectionName = function(collectionName, next, callback) {
    JsonSchema.findOne({ where: { collectionName: collectionName }}, function(err, jsonSchema) {
        if (err) {
            logger.error("Error fetching JSON Schema for collectionName:", collectionName, "Error:", err);
        } else if (jsonSchema === null) {
            logger.warn("JSON Schema for collectionName", collectionName, "not found.");
        } else {
            callback(jsonSchema);
        }
        next();
    });
};

JsonSchema.defaultLinks = function(ljsReq, collectionName) {
    var href = ljsReq && (ljsReq.baseUrl() + '/' + collectionName + '/{id}')
    return [
        { rel: 'self', href: href },
        { rel: 'item', href: href },
        { rel: 'update', method: 'PUT', href: href },
        { rel: 'delete', method: 'DELETE', href: href }
    ];
};

JsonSchema.prototype.update$schema = function() {
    if (!this.$schema) {
        this.$schema = "http://json-schema.org/draft-04/hyper-schema#";
    }
};

JsonSchema.prototype.createLoopbackModel = function(app) {
    var JsonSchemaModel = JsonSchema.dataSource.createModel(this.modelName, {}, { plural: this.collectionName });
    app.model(JsonSchemaModel);
    loopbackExplorer(app);
};

JsonSchema.prototype.buildSchemaUri = function() {
    return '/json-schemas/' + this.id;
};

JsonSchema.on('attached', function(app) {
    JsonSchema.afterRemote('**', function(ctx, result, next) {
        if (ctx.result) {
            var ljsReq = new LJSRequest(ctx.req, app);
            var defaultLinks = JsonSchema.defaultLinks(ljsReq, result.collectionName);
            var customLinks = result.links;
            var jsonSchemaLinks = new JsonSchemaLinks(ljsReq, defaultLinks, customLinks);
            ctx.result.links = jsonSchemaLinks.all();
        }
        next();
    });

    JsonSchema.afterInitialize = function() {
        modelPropertiesSanitizer.restore(this);
    }

    JsonSchema.beforeSave = function(next) {
        this.update$schema();
        modelPropertiesSanitizer.sanitize(this);
        next();
    };

    JsonSchema.afterSave = function(done) {
        this.createLoopbackModel(app);
        modelPropertiesSanitizer.restore(this);
        done();
    };
});
