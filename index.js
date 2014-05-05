module.exports = loopbackJsonSchema = {};

var loopback = require('loopback');
var JsonSchema = require('./lib/models/json-schema');
var jsonSchemaMiddleware = require('./lib/middleware/json-schema.middleware');
var httpHeaderMiddleware = require('./lib/middleware/http-header.middleware');

loopbackJsonSchema.initLoopbackJsonSchema = function(app) {
    var db = dataSource(app);
    JsonSchema.attachTo(db);

    app.model(JsonSchema);

    app.on('middleware:preprocessors', function() {
        app.use(app.get('restApiRoot'), jsonSchemaMiddleware());
        app.use(app.get('restApiRoot'), httpHeaderMiddleware());
    });
};


function dataSource (app) {
    return app.dataSources.loopbackJsonSchemaDb || loopback.memory();
};
