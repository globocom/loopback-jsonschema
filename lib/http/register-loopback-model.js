var logger = require('../support/logger');

var models = require('../domain/models');
var ItemSchema = require('../domain/item-schema');

module.exports = {
    handle: function(ljsReq, callback) {
        var collectionName = ljsReq.ljsUrl().collectionName;

        var Model = models.fromPluralModelName(ljsReq.app, collectionName);
        if (Model) {
            return callback(null);
        }

        ItemSchema.findByCollectionName(collectionName, function(err, itemSchema) {
            if (err) { return callback(err); }

            if (itemSchema === null) {
                return callback(null);
            }

            itemSchema.registerLoopbackModel(ljsReq.app, function(err) {
                if (err) { return callback(err); }
                logger.info('Loopback Model created for JSON Schema collectionName: ', itemSchema.collectionName);
                callback(null);
            });
        });
    }
};
