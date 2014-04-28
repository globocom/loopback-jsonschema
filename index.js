module.exports = loopbackJsonSchema = {};

var JsonSchema = require('./lib/models/json-schema');
var jsonSchemaMiddleware = require('./lib/middleware/json-schema.middleware');

loopbackJsonSchema.initLoopbackJsonSchema = function(app) {
    app.model(JsonSchema);

    app.on('middleware:preprocessors', function() {
        app.use(app.get('restApiRoot'), jsonSchemaMiddleware());
    });
};
