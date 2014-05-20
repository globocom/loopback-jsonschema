var logger = require('../support/logger');

var JsonSchema = require('../models/json-schema');
var LJSUrl = require('../models/ljs-url');
var config = require('../support/config');

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
    var schemaLink;
    var ljsUrl = LJSUrl.buildFromRequest(this.ljsReq);

    if (ljsUrl.isCollection()) {
        instance = new config.CollectionSchemaClass(this.ljsReq, instance.id);
    }

    schemaLink = LJSUrl.buildFromModel(this.ljsReq, instance).url;

    this.res.set('Content-Type', "application/json; charset=utf-8; profile="+ schemaLink);
    this.res.set('Link', '<' + schemaLink + '>; rel=describedby');
};

InstanceService.prototype.build = function(next) {
    var collectionName = this.ljsReq.collectionName;

    var self = this;
    JsonSchema.findByCollectionName(collectionName, next, function(itemSchema) {
        self.handleRequest(itemSchema);
        self.handleResponse(itemSchema);
    });
};

module.exports = InstanceService;