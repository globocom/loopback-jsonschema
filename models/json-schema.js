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

JsonSchema.prototype.createModel = function(app) {
    var JsonSchemaModel = db.createModel(this.title);
    app.model(JsonSchemaModel);
    loopbackExplorer(app);
};


JsonSchema.on('attached', function(app) {
    JsonSchema.beforeSave = function(next, properties) {
        this.update$schema(properties);
        next();
    };
    JsonSchema.afterSave = function(done) {
        this.createModel(app);
        done();
    };
});
