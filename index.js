var loopbackJsonSchema = module.exports = {};

var _ = require('underscore');
var loopback = require('loopback');

var config = require('./lib/support/config');
var ItemSchema = require('./lib/domain/item-schema');
var jsonSchemaMiddleware = require('./lib/http/json-schema.middleware');
var jsonSchemaRoutes = require('./lib/http/json-schema-routes');
var logger = require('./lib/support/logger');


loopbackJsonSchema.init = function(app, customConfig) {
    _.extend(config, customConfig);
    logger.transports.console.level = config.logLevel;

    var db = dataSource(app);
    ItemSchema.attachTo(db);

    app.model(ItemSchema);

    app.use(app.get('restApiRoot') || '/api', jsonSchemaMiddleware());
    jsonSchemaRoutes.draw(app);
};


loopbackJsonSchema.CollectionSchema = require('./lib/domain/collection-schema');
loopbackJsonSchema.ItemSchema = require('./lib/domain/item-schema');
loopbackJsonSchema.LJSRequest = require('./lib/http/ljs-request');


function dataSource (app) {
    return app.dataSources.loopbackJsonSchemaDb || loopback.memory();
};
