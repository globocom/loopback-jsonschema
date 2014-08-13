var logger = require('../support/logger');

var ItemSchema = require('../domain/item-schema');
var instanceSchemaCorrelator = require('../http/instance-schema-correlator');

var instanceRequest = module.exports = {
    handle: function(ljsReq, res, callback) {
        var collectionName = ljsReq.ljsUrl().collectionName;
        ItemSchema.findByCollectionName(collectionName, function(err, itemSchema) {
            if (err) { return callback(err); }

            if (itemSchema) {
                handleRequest(itemSchema, ljsReq, function(err) {
                    handleResponse(itemSchema, ljsReq, res);
                    callback(err);
                });
            } else {
                callback();
            }
        });
    }
};

function handleRequest(itemSchema, ljsReq, callback) {
    itemSchema.registerLoopbackModel(ljsReq.req.app, function(err) {
        callback(err);
    });
    logger.info('Loopback Model created for JSON Schema collectionName: ', itemSchema.collectionName);
}

function handleResponse(itemSchema, ljsReq, res) {
    instanceSchemaCorrelator.correlate(itemSchema, ljsReq, res);
}
