require("fast-url-parser").replace();

var _ = require('underscore');


var loopback = require('loopback');

var config = require('./lib/support/config');
var ItemSchema = require('./lib/domain/item-schema');
var registerLoopbackModelMiddleware = require('./lib/http/register-loopback-model.middleware');
var validateRequestMiddleware = require('./lib/http/validate-request.middleware');
var jsonSchemaMiddleware = require('./lib/http/json-schema.middleware');
var jsonSchemaRoutes = require('./lib/http/json-schema-routes');
var logger = require('./lib/support/logger');

var loopbackJsonSchema = module.exports = {};
loopbackJsonSchema.init = function(app, customConfig) {
    _.extend(config, customConfig);
    app.set('remoting', {json: {type: ['json', '+json']}});

    logger.transports.console.level = config.logLevel;

    // save app pointer
    ItemSchema.app = app;

    var db = dataSource(app);
    ItemSchema.attachTo(db);
    app.model(ItemSchema);

    var restApiRoot = app.get('restApiRoot') || '/api';
    var middlewares = [
        validateRequestMiddleware(app)
    ];

    if (config.registerItemSchemaAtRequest) {
        middlewares.push(registerLoopbackModelMiddleware(app));
    } else {
        // load all item schemas at boot
        ItemSchema.preLoadModels();
    }

    app.use(restApiRoot, middlewares);
};

loopbackJsonSchema.enableJsonSchemaMiddleware = function(app) {
    var corsOptions = (app.get('remoting') && app.get('remoting').cors) || {};
    var restApiRoot = app.get('restApiRoot') || '/api';

    app.use(restApiRoot, [
        jsonSchemaMiddleware(),
        jsonSchemaRoutes.drawRouter(corsOptions)
    ]);
};

loopbackJsonSchema.CollectionSchema = require('./lib/domain/collection-schema');
loopbackJsonSchema.ItemSchema = require('./lib/domain/item-schema');
loopbackJsonSchema.LJSRequest = require('./lib/http/ljs-request');
loopbackJsonSchema.LJSUrl = require('./lib/http/ljs-url');

function dataSource(app) {
    return app.dataSources.loopbackJsonSchemaDb || loopback.memory();
}
