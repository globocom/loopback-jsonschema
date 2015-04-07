var config = require('../support/config');
var schemaCorrelator = require('./schema-correlator');

module.exports = function schemaCorrelateHooks(model) {
    var collectionName = model.pluralModelName;
    var remotes = config.instanceRemoteNames;
    for (var i=0; i<remotes.length; i++) {
        model.afterRemote(remotes[i], schemaCorrelator.instance.bind(null, collectionName));
    }

    model.afterRemote(config.collectionRemoteName, schemaCorrelator.collection.bind(null, collectionName));
};
