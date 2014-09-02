var logger = require('../support/logger');

var ItemSchema = require('../domain/item-schema');
var instanceSchemaCorrelator = require('../http/instance-schema-correlator');

var instanceRequest = module.exports = {
    handle: function(ljsReq, res, callback) {
        var collectionName = ljsReq.ljsUrl().collectionName;
        ItemSchema.findByCollectionName(collectionName, function(err, itemSchema) {
            if (err) { return callback(err); }

            if (itemSchema === null) {
                return callback();
            }

            handleResponse(itemSchema, ljsReq, res);
            callback(null);
        });
    }
};

function handleResponse(itemSchema, ljsReq, res) {
    instanceSchemaCorrelator.correlate(itemSchema, ljsReq, res);
}
