var logger = require('../support/logger');

var ItemSchema = require('../domain/item-schema');
var LJSUrl = require('../http/ljs-url');
var config = require('../support/config');
var instanceSchemaCorrelator = require('../http/instance-schema-correlator');


var InstanceService = function(ljsReq, res) {
    this.ljsReq = ljsReq;
    this.res = res;
};

InstanceService.prototype.handleRequest = function(itemSchema) {
    // Register Loopback Model for given Collection
    itemSchema.createLoopbackModel(this.ljsReq.req.app);
    logger.info("Loopback Model created for JSON Schema collectionName: ", itemSchema.collectionName);
};

InstanceService.prototype.build = function(callback) {
    var collectionName = this.ljsReq.ljsUrl().collectionName;
    var self = this;
    ItemSchema.findByCollectionName(collectionName, function(err, itemSchema) {
        if (err) { throw err; }
        self.handleRequest(itemSchema);
        instanceSchemaCorrelator.correlate(itemSchema, self.ljsReq, self.res);
        callback();
    });
};

module.exports = InstanceService;