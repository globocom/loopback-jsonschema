/**
 * Module dependencies.
 */

var JsonSchema = require('../models/json-schema');
var LJSRequest = require('../models/ljs-request');
var InstanceService = require('../service/instance.service');

/**
 * Export the middleware.
 */

module.exports = jsonSchemaMiddleware;

function jsonSchemaMiddleware() {
    return function (req, res, next) {
        var ljsReq  = new LJSRequest(req, req.app);
        var collectionName = ljsReq.collectionName;

        if (collectionName === "json-schemas" || collectionName === "collection-schemas") {
            return next();
        }

        var instanceService = new InstanceService(ljsReq, res);
        instanceService.build(next);
    };
}