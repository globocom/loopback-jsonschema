module.exports = loopbackJsonSchema = {};

var loopback = require('loopback');
var JsonSchema = require('./lib/models/json-schema');
var jsonSchemaMiddleware = require('./lib/middleware/json-schema.middleware');

loopbackJsonSchema.initLoopbackJsonSchema = function(app) {
    var db = app.dataSources.jsonSchemaDb || loopback.memory();
    JsonSchema.attachTo(db);

    app.model(JsonSchema);

    app.on('middleware:preprocessors', function() {
        app.use(app.get('restApiRoot'), jsonSchemaMiddleware());
    });
};
