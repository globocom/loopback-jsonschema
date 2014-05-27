var logger = require('../support/logger');

var ItemSchema = require('../domain/item-schema');
var instanceSchemaCorrelator = require('../http/instance-schema-correlator');


var instanceRequest = module.exports = {
    handle: function(ljsReq, res, callback) {
        var collectionName = ljsReq.ljsUrl().collectionName;
        ItemSchema.findByCollectionName(collectionName, function(err, itemSchema) {
            handleRequest(itemSchema, ljsReq);
            instanceSchemaCorrelator.correlate(itemSchema, ljsReq, res);
            callback(err);
        });
    }
};

function handleRequest(itemSchema, ljsReq) {
    itemSchema.createLoopbackModel(ljsReq.req.app);
    logger.info("Loopback Model created for JSON Schema collectionName: ", itemSchema.collectionName);
};
