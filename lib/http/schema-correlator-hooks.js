
var config = require('../support/config');
var schemaCorrelator = require('./schema-correlator');

module.exports = function schemaCorrelateHooks(schema, model) {
    var schemaUrl = schema.url();
    var collectionSchemaUrl = schema.collectionSchema().url();

    (function(model, schemaUrl, collectionSchemaUrl) {
        var remotes = config.instanceRemoteNames;
        for (var i=0; i<remotes.length; i++) {
            model.afterRemote(remotes[i], function(ctx, instance, next) {
                schemaCorrelator(ctx.req, ctx.res, schemaUrl);
                next();
            });
        }

        model.afterRemote(config.collectionRemoteName, function(ctx, instance, next) {
            schemaCorrelator(ctx.req, ctx.res, collectionSchemaUrl);
            next();
        });
    })(model, schemaUrl, collectionSchemaUrl);
};
