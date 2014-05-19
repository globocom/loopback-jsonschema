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
    this.addHeaders(instance);
};

InstanceService.prototype.addHeaders = function(instance) {
    var collectionName = this.ljsReq.collectionName;
    var baseUrl = this.ljsReq.baseUrl();
    // FIXME
    var schemaCollection = ( this.ljsReq.resourceId !== null ? 'json-schemas' : 'collection-schemas');

    var schemaLink = baseUrl + '/' + schemaCollection + '/' + instance.id;
    this.res.set('Content-Type', "application/json; charset=utf-8; profile="+ schemaLink);
    this.res.set('Link', '<' + schemaLink + '>; rel=describedby');

    logger.info("Json Schema headers added for: ", this.ljsReq.collectionName);
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
