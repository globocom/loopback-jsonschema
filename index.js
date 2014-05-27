module.exports = loopbackJsonSchema = {};

var _ = require('underscore');
var loopback = require('loopback');

var config = require('./lib/support/config');
var ItemSchema = require('./lib/domain/item-schema');
var jsonSchemaRoutes = require('./lib/http/json-schema-routes');
var jsonSchemaMiddleware = require('./lib/middleware/json-schema.middleware');

loopbackJsonSchema.init = function(app, customConfig) {
    _.extend(config, customConfig);

    var db = dataSource(app);
    ItemSchema.attachTo(db);

    app.model(ItemSchema);

    app.on('middleware:preprocessors', function() {
        app.use(app.get('restApiRoot'), jsonSchemaMiddleware());
        jsonSchemaRoutes.draw(app);
    });
};

loopbackJsonSchema.CollectionSchema = require('./lib/domain/collection-schema');

function dataSource (app) {
    return app.dataSources.loopbackJsonSchemaDb || loopback.memory();
};