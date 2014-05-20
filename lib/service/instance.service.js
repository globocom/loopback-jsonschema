var logger = require('../support/logger');

var JsonSchema = require('../models/json-schema');
var LJSUrl = require('../models/ljs-url');
var config = require('../support/config');

var InstanceService = function(ljsReq, res) {
    this.ljsReq = ljsReq;
    this.res = res;
};

InstanceService.prototype.handleRequest = function(itemSchema) {
    // Register Loopback Model for given Collection
    itemSchema.createLoopbackModel(this.ljsReq.req.app);
    logger.info("Loopback Model created for JSON Schema collectionName: ", itemSchema.collectionName);
};

InstanceService.prototype.handleResponse = function(itemSchema) {
    this.addHeaders(itemSchema);
};

InstanceService.prototype.addHeaders = function(itemSchema) {
    var ljsUrl = this.ljsReq.ljsUrl();

    var schemaLink;
    if (ljsUrl.isCollection()) {
        var collectionSchema = new config.CollectionSchemaClass(this.ljsReq, itemSchema.id);
        schemaLink = LJSUrl.buildFromModel(this.ljsReq, collectionSchema).url;
    } else {
        schemaLink = LJSUrl.buildFromModel(this.ljsReq, itemSchema).url;
    }

    addHeaders(this.res, schemaLink);
};

function addHeaders (res, schemaLink) {
    res.set('Content-Type', "application/json; charset=utf-8; profile="+ schemaLink);
    res.set('Link', '<' + schemaLink + '>; rel=describedby');
};

InstanceService.prototype.build = function(next) {
    var collectionName = this.ljsReq.ljsUrl().collectionName;
    var self = this;
    JsonSchema.findByCollectionName(collectionName, next, function(itemSchema) {
        self.handleRequest(itemSchema);
        self.handleResponse(itemSchema);
    });
};

module.exports = InstanceService;