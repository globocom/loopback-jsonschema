var debug = require('debug')('json-schema');

var loopback = require('loopback');
var loopbackExplorer = require('loopback-explorer');
var db = loopback.memory('db');

var LJSRequest = require('./ljs-request');


var JsonSchema = module.exports = db.createModel('json-schema');


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
    var JsonSchemaModel = db.createModel(this.modelName, {}, { plural: this.collectionName });
    app.model(JsonSchemaModel);
    loopbackExplorer(app);
};

JsonSchema.registerLoopbackModelForCollection = function(collectionName, app, next) {
    JsonSchema.findOne({ where: { collectionName: collectionName }}, function(err, jsonSchema) {
        if (err) {
            console.error("Error fetching JSON Schema for collectionName:", collectionName, "Error:", err);
        } else if (jsonSchema === null) {
            console.warn("JSON Schema for collectionName:", collectionName, "Not found.");
        } else {
            jsonSchema.createLoopbackModel(app);
            console.info("Loopback Model created for JSON Schema collectionName:", collectionName);
        }
        next();
    });
};


JsonSchema.on('attached', function(app) {
    JsonSchema.beforeRemote('**', function(ctx, result, next) {
        JsonSchema.addLinks(new LJSRequest(ctx.req), app);
        next();
    });

    JsonSchema.beforeSave = function(next) {
        this.update$schema();
        next();
    };

    JsonSchema.afterSave = function(done) {
        this.createLoopbackModel(app);
        done();
    };
});
