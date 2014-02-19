var loopback = require('loopback');
var loopbackExplorer = require('loopback-explorer');
var db = loopback.memory('db');


var JsonSchema = module.exports = db.createModel('json-schema');

JsonSchema.on('attached', function(app) {
    JsonSchema.beforeSave = function(next, jsonSchema) {
        beforeSave(jsonSchema, next)
    };
    JsonSchema.afterSave = function(done) {
        afterSave(this, app, done);
    };
});

function beforeSave(jsonSchema, next) {
    jsonSchema.$schema = "http://json-schema.org/draft-03/hyper-schema#";
    next();
}

function afterSave(jsonSchema, app, done) {
    var JsonSchemaModel = db.createModel(jsonSchema.title);
    app.model(JsonSchemaModel);
    loopbackExplorer(app);
    done();
};
