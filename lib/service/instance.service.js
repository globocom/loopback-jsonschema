var logger = require('../support/logger');

var JsonSchema = require('../models/json-schema');
var LJSUrl = require('../models/ljs-url');
var config = require('../support/config');

var InstanceService = function(ljsReq, res) {
    this.ljsReq = ljsReq;
    this.res = res;
};

InstanceService.prototype.handleRequest = function(schema) {
    // Register Loopback Model for given Collection
    schema.createLoopbackModel(this.ljsReq.req.app);
    logger.info("Loopback Model created for JSON Schema collectionName: ", this.ljsReq.collectionName);
};

InstanceService.prototype.handleResponse = function(schema) {
    // var ljsUrl = LJSUrl.buildFromRequest(this.ljsReq);

    // if (ljsUrl.isCollection()) {
    //     schema = new config.CollectionSchemaClass(this.ljsReq, schema.id);
    // }
    // schema = LJSUrl.buildFromModel(this.ljsReq, schema);


    this.addHeaders(schema);
};

InstanceService.prototype.addHeaders = function(schema) {
    var schemaLink;
    var ljsUrl = LJSUrl.buildFromRequest(this.ljsReq);

    if (ljsUrl.isCollection()) {
        schema = new config.CollectionSchemaClass(this.ljsReq, schema.id);
    }

    schemaLink = LJSUrl.buildFromModel(this.ljsReq, schema).url;

    // var schemaLink = schema.url;

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