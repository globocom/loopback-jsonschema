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
    var entityPath = '/people/{id}';
    this.links = [
        {rel: 'self', href: 'http://localhost:3000/api' + entityPath},
        {rel: 'item', href: 'http://localhost:3000/api' + entityPath},
        {rel: 'update', method: 'PUT', href: 'http://localhost:3000/api' + entityPath},
        {rel: 'delete', method: 'DELETE', href: 'http://localhost:3000/api' + entityPath}
    ];
};

JsonSchema.prototype.createLoopbackModel = function(app) {
    var JsonSchemaModel = db.createModel(this.title);
    app.model(JsonSchemaModel);
    loopbackExplorer(app);
};


JsonSchema.on('attached', function(app) {
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
