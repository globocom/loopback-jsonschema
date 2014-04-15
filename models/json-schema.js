var debug = require('debug')('json-schema');

var loopback = require('loopback');
var loopbackExplorer = require('loopback-explorer');
var db = loopback.memory('db');


var JsonSchema = module.exports = db.createModel('json-schema');


JsonSchema.addLinks = function(body, baseUrl) {
    var entityPath = '/' + body.collectionName + '/{id}';
    var defaultLinks = [
        {rel: 'self', href: baseUrl + entityPath},
        {rel: 'item', href: baseUrl + entityPath},
        {rel: 'update', method: 'PUT', href: baseUrl + entityPath},
        {rel: 'delete', method: 'DELETE', href: baseUrl + entityPath}
    ];
    var defaultRels = defaultLinks.map(function(link) {
        return link.rel;
    });
    var customLinks = body.links || [];
    customLinks = customLinks.filter(function(link) {
        return defaultRels.indexOf(link.rel) == -1;
    });
    body.links = defaultLinks.concat(customLinks);
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


JsonSchema.on('attached', function(app) {
    JsonSchema.beforeRemote('**', function(ctx, result, next) {
        var baseUrl = req.protocol + '://' + req.get('Host') + app.get('restApiRoot');
        JsonSchema.addLinks(ctx.req.body, baseUrl);
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
