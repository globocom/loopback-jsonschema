module.exports = loopbackJsonSchema = {};

var loopback = require('loopback');
var JsonSchema = require('./lib/models/json-schema');
var jsonSchemaRoutes = require('./lib/config/json-schema-routes');
var jsonSchemaMiddleware = require('./lib/middleware/json-schema.middleware');

loopbackJsonSchema.initLoopbackJsonSchema = function(app) {
    var db = dataSource(app);
    JsonSchema.attachTo(db);

    app.model(JsonSchema);

    app.on('middleware:preprocessors', function() {
        app.use(app.get('restApiRoot'), jsonSchemaMiddleware());
    });

    jsonSchemaRoutes.draw(app);
};


function dataSource (app) {
    return app.dataSources.loopbackJsonSchemaDb || loopback.memory();
};
