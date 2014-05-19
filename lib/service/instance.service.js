var logger = require('../support/logger');

var JsonSchema = require('../models/json-schema');

var InstanceService = function(ljsReq, res) {
    this.ljsReq = ljsReq;
    this.res = res;
};

InstanceService.prototype.handleRequest = function(jsonSchema) {
    // Register Loopback Model for given Collection
    jsonSchema.createLoopbackModel(this.ljsReq.req.app);
    logger.info("Loopback Model created for JSON Schema collectionName: ", this.ljsReq.collectionName);
};

InstanceService.prototype.handleResponse = function(instance) {
    this.addHeaders(this.ljsReq, this.res, instance);
    logger.info("Json Schema headers added for: ", this.ljsReq.collectionName);
};

InstanceService.prototype.addHeaders = function(ljsReq, res, instance) {
    var collectionName = this.ljsReq.collectionName;
    var baseUrl = ljsReq.baseUrl();
    // FIXME
    var schemaCollection = ( ljsReq.resourceId !== null ? 'json-schemas' : 'collection-schemas');

    var schemaLink = baseUrl + '/' + schemaCollection + '/' + instance.id;
    res.set('Content-Type', "application/json; charset=utf-8; profile="+ schemaLink);
    res.set('Link', '<' + schemaLink + '>; rel=describedby');
};

InstanceService.prototype.build = function(next) {
    var collectionName = this.ljsReq.collectionName;

    var self = this;
    JsonSchema.findByCollectionName(collectionName, next, function(jsonSchema) {
        self.handleRequest(jsonSchema);
        self.handleResponse(jsonSchema);
    });
};

module.exports = InstanceService;
