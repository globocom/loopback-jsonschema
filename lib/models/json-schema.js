var debug = require('debug')('json-schema');

var loopback = require('loopback');
var loopbackExplorer = require('loopback-explorer');
var LJSRequest = require('./ljs-request');

var Model = require('loopback').Model;
var JsonSchema = module.exports = Model.extend('json-schema');

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
    var db = this.dataSource(app);
    var JsonSchemaModel = db.createModel(this.modelName, {}, { plural: this.collectionName });

    app.model(JsonSchemaModel);
    loopbackExplorer(app);
};

JsonSchema.prototype.dataSource = function(app) {
    return app.dataSources.jsonSchemaDb || loopback.memory();
};

JsonSchema.on('attached', function(app) {
    JsonSchema.beforeRemote('**', function(ctx, result, next) {
        JsonSchema.addLinks(new LJSRequest(ctx.req), app);
        next();
    });

    JsonSchema.afterInitialize = function(jsonSchema) {
        if (this['%24schema']) {
            this.$schema = this['%24schema'];
            delete this.__data['%24schema'];
            delete this['%24schema'];
        }
    }

    JsonSchema.beforeSave = function(next) {
        this.update$schema();
        if (this.$schema) {
            this['%24schema'] = this.$schema;
            delete this.$schema;
        }
        next();
    };

    JsonSchema.afterSave = function(done) {
        this.createLoopbackModel(app);
        if (this['%24schema']) {
            this.$schema = this['%24schema'];
            delete this['%24schema'];
        }
        done();
    };
});
