/**
 * Module dependencies.
 */
var LJSRequest = require('../models/ljs-request');
var JsonSchema = require('../models/json-schema');
var _ = require('underscore');

/**
 * Export the middleware.
 */

module.exports = httpHeaderMiddleware;

function httpHeaderMiddleware() {
    return function (req, res, next) {
        var ljsReq  = new LJSRequest(req);
        var collectionName = ljsReq.collectionName;
        var resourceId     = ljsReq.resourceId;

        if ((collectionName === "json-schemas") || _.isEmpty(resourceId)) {
            return next();
        }

        JsonSchema.findByCollectionName(ljsReq, next, function(jsonSchema) {
            jsonSchema.addHeaders(ljsReq, res);
        });
    };
}