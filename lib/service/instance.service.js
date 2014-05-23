var logger = require('../support/logger');

var ItemSchema = require('../models/item-schema');
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
    // TODO: This if needs to be better encapsulated somehow.
    if (ljsUrl.isCollection() && this.ljsReq.method === 'GET') {
        var collectionSchema = new config.CollectionSchemaClass(itemSchema.id);
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
    ItemSchema.findByCollectionName(collectionName, next, function(itemSchema) {
        self.handleRequest(itemSchema);
        self.handleResponse(itemSchema);
    });
};

module.exports = InstanceService;