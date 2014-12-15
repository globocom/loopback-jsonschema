var config = require('../support/config');
var schemaCorrelator = require('./schema-correlator');

module.exports = function schemaCorrelateHooks(model) {
    var collectionName = model.pluralModelName;
    var remotes = config.instanceRemoteNames;
    for (var i=0; i<remotes.length; i++) {
        model.afterRemote(remotes[i], function(ctx, instance, next) {
            schemaCorrelator.correlateInstance(collectionName, ctx, next);
        });
    }

    model.afterRemote(config.collectionRemoteName, function(ctx, instance, next) {
        schemaCorrelator.correlateCollection(collectionName, ctx, next);
    });
};
