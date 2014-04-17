module.exports = loopbackJsonSchema = {};

var JsonSchema = require('./models/json-schema');
var jsonSchemaMiddleware = require('./middleware/json-schema.middleware');

loopbackJsonSchema.initLoopbackJsonSchema = function(app) {
    app.model(JsonSchema);

    app.on('middleware:preprocessors', function() {
        app.use(app.get('restApiRoot'), jsonSchemaMiddleware());
    });
};
