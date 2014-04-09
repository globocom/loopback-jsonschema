var loopback = require('loopback');
var loopbackExplorer = require('loopback-explorer');
var db = loopback.memory('db');


var JsonSchema = module.exports = db.createModel('json-schema');

JsonSchema.on('attached', function(app) {
    JsonSchema.beforeSave = function(next, jsonSchema) {
        beforeSave(next, jsonSchema)
    };
    JsonSchema.afterSave = function(done) {
        afterSave(done, this, app);
    };
});

function beforeSave(next, jsonSchema) {
    jsonSchema.$schema = "http://json-schema.org/draft-04/hyper-schema#";
    next();
}

function afterSave(done, jsonSchema, app) {
    var JsonSchemaModel = db.createModel(jsonSchema.title);
    app.model(JsonSchemaModel);
    loopbackExplorer(app);
    done();
};
