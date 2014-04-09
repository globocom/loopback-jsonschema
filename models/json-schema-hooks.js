var loopback = require('loopback');
var loopbackExplorer = require('loopback-explorer');
var db = loopback.memory('db');


module.exports = {
    beforeSave: beforeSave,
    afterSave: afterSave
}

function beforeSave(next, jsonSchema) {
    if (!jsonSchema.$schema) {
        jsonSchema.$schema = "http://json-schema.org/draft-04/hyper-schema#";
    }
    next();
}

function afterSave(done, jsonSchema, app) {
    var JsonSchemaModel = db.createModel(jsonSchema.title);
    app.model(JsonSchemaModel);
    loopbackExplorer(app);
    done();
};
