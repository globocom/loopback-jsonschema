/**
 * Module dependencies.
 */

var LJSRequest = require('../models/ljs-request');
var InstanceService = require('../service/instance.service');

/**
 * Export the middleware.
 */

module.exports = jsonSchemaMiddleware;

function jsonSchemaMiddleware() {
    return function (req, res, next) {
        var ljsReq  = new LJSRequest(req, req.app);
        var collectionName = ljsReq.ljsUrl().collectionName;

        if (collectionName === "item-schemas" || collectionName === "collection-schemas") {
            return next();
        }

        var instanceService = new InstanceService(ljsReq, res);
        instanceService.build(next);
    };
}