var _ = require('lodash');


var loopback = require('loopback');

var config = require('./lib/support/config');
var ItemSchema = require('./lib/domain/item-schema');
var Relations = require('./lib/domain/relations');
var registerLoopbackModelMiddleware = require('./lib/http/register-loopback-model.middleware');
var validateRequestMiddleware = require('./lib/http/validate-request.middleware');
var schemaCorrelatorHooks = require('./lib/http/schema-correlator-hooks');
var createLocationHook = require('./lib/http/create-location-hook');
var locationHeaderCorrelator = require('./lib/http/location-header-correlator');
var jsonSchemaRoutes = require('./lib/http/json-schema-routes');
var ItemSchemaHooks = require('./lib/http/item-schema-hooks');
var schemaCorrelator = require('./lib/http/schema-correlator');

var loopbackJsonSchema = module.exports = {};
loopbackJsonSchema.init = function(app, customConfig) {
    _.extend(config, customConfig);
    var remoting = app.get('remoting') || {};
    remoting.json = remoting.json || {};
    remoting.json.type = ['json', '+json'];
    app.set('remoting', remoting);

    // save app pointer
    ItemSchema.app = app;

    var relations = Relations.init(app);
    relations.bindAfterRemoteHook('hasMany', 'create', function correlateLocationHeader(relationCtx, ctx, result, next) {
        locationHeaderCorrelator(ctx, result, next);
    });

    var schemaHook = function correlateInstance(relationCtx, ctx, result, next) {
        schemaCorrelator.instance(relationCtx.toPluralModelName, ctx, result, next);
    };

    relations.bindAfterRemoteHook('belongsTo', 'get', schemaHook);
    relations.bindAfterRemoteHook('hasMany', 'get', function correlateCollection (relationCtx, ctx, result, next) {
        schemaCorrelator.collection(relationCtx.toPluralModelName, ctx, result, next);
    });
    relations.bindAfterRemoteHook('hasMany', 'create', schemaHook);
    relations.bindAfterRemoteHook('hasMany', 'findById', schemaHook);
    relations.bindAfterRemoteHook('hasMany', 'updateById', schemaHook);


    ItemSchema.app._registeredLoopbackHooks = {};

    // start with default hooks
    ItemSchema.remoteHookInitializers = ItemSchema.defaultRemoteHookInitializers.slice(0);
    ItemSchema.registerRemoteHookInitializers([
        createLocationHook,
        schemaCorrelatorHooks
    ]);

    var db = dataSource(app);
    ItemSchema.attachTo(db);

    app.model(ItemSchema);
    ItemSchemaHooks.initialize();

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
        jsonSchemaRoutes.drawRouter(corsOptions)
    ]);
};

loopbackJsonSchema.CollectionSchema = require('./lib/domain/collection-schema');
loopbackJsonSchema.LJSRequest = require('./lib/http/ljs-request');
loopbackJsonSchema.LJSUrl = require('./lib/http/ljs-url');
loopbackJsonSchema.indexes = require('./lib/domain/indexes');
loopbackJsonSchema.schemaLinkRewriter = require('./lib/http/schema-link-rewriter');
loopbackJsonSchema.schemaCorrelator = require('./lib/http/schema-correlator');
loopbackJsonSchema.locationHeaderCorrelator = require('./lib/http/location-header-correlator');
loopbackJsonSchema.Relations = Relations;
loopbackJsonSchema.ItemSchema = ItemSchema;
loopbackJsonSchema.Links = require('./lib/domain/links');

function dataSource(app) {
    return app.dataSources.loopbackJsonSchemaDb || loopback.memory();
}
