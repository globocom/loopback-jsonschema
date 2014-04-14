var debug = require('debug')('json-schema');

var loopback = require('loopback');
var loopbackExplorer = require('loopback-explorer');
var db = loopback.memory('db');


var JsonSchema = module.exports = db.createModel('json-schema');


JsonSchema.prototype.update$schema = function(properties) {
    this.$schema = "http://json-schema.org/draft-04/hyper-schema#";
    if (properties && properties.$schema) {
        this.$schema = properties.$schema;
    }
};

JsonSchema.prototype.addLinks = function() {
    var entityPath = '/' + this.collectionName + '/{id}';
    this.links = [
        {rel: 'self', href: JsonSchema.baseUrl + entityPath},
        {rel: 'item', href: JsonSchema.baseUrl + entityPath},
        {rel: 'update', method: 'PUT', href: JsonSchema.baseUrl + entityPath},
        {rel: 'delete', method: 'DELETE', href: JsonSchema.baseUrl + entityPath}
    ];
};

JsonSchema.prototype.createLoopbackModel = function(app) {
    var JsonSchemaModel = db.createModel(this.modelName);
    app.model(JsonSchemaModel);
    loopbackExplorer(app);
};


JsonSchema.on('attached', function(app) {
    JsonSchema.beforeRemote('**', function(ctx, result, next) {
        JsonSchema.baseUrl = ctx.req.protocol + '://' + ctx.req.get('Host') + app.get('restApiRoot');
        next();
    });

    JsonSchema.beforeSave = function(next, properties) {
        this.update$schema(properties);
        this.addLinks();
        next();
    };

    JsonSchema.afterSave = function(done) {
        this.createLoopbackModel(app);
        done();
    };
});
