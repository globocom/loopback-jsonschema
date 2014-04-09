var debug = require('debug')('json-schema');

var loopback = require('loopback');
var db = loopback.memory('db');

var jsonSchemaHooks = require('./json-schema-hooks');


var JsonSchema = module.exports = db.createModel('json-schema');

JsonSchema.on('attached', function(app) {
    JsonSchema.beforeSave = function(next, jsonSchema) {
        jsonSchemaHooks.beforeSave(next, jsonSchema)
    };
    JsonSchema.afterSave = function(done) {
        jsonSchemaHooks.afterSave(done, this, app);
    };
});
