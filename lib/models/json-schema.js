var debug = require('debug')('json-schema');

var loopback = require('loopback');
var loopbackExplorer = require('loopback-explorer');

var logger = require('../support/logger')
var LJSRequest = require('./ljs-request');
var modelPropertiesSanitizer = require('./model-properties-sanitizer');

var Model = require('loopback').Model;
var JsonSchema = module.exports = Model.extend('json-schema');

JsonSchema.prototype.addHeaders = function(ljsReq, res) {
    var baseUrl = ljsReq.baseUrl();

    var schemaLink = baseUrl + '/json-schemas/' + this.id;
    res.set('Content-Type', "application/json; charset=utf-8; profile="+ schemaLink);
    res.set('Link', '<' + schemaLink + '>; rel=describedby');
};

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


JsonSchema.addLinks = function(req, app) {
    var baseUrl = req.schemeAndAuthority() + app.get('restApiRoot');
    var entityPath = '/' + req.body.collectionName + '/{id}';
    var defaultLinks = [
        {rel: 'self', href: baseUrl + entityPath},
        {rel: 'item', href: baseUrl + entityPath},
        {rel: 'update', method: 'PUT', href: baseUrl + entityPath},
        {rel: 'delete', method: 'DELETE', href: baseUrl + entityPath}
    ];
    var defaultRels = defaultLinks.map(function(link) {
        return link.rel;
    });
    var customLinks = req.body.links || [];
    customLinks = customLinks.filter(function(link) {
        return defaultRels.indexOf(link.rel) == -1;
    });
    req.body.links = defaultLinks.concat(customLinks);
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

JsonSchema.on('attached', function(app) {
    JsonSchema.beforeRemote('**', function(ctx, result, next) {
        JsonSchema.addLinks(new LJSRequest(ctx.req), app);
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
