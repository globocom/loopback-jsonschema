/**
 * Module dependencies.
 */

var JsonSchema = require('../models/json-schema');
var LJSRequest = require('../models/ljs-request');

/**
 * Export the middleware.
 */

module.exports = jsonSchemaMiddleware;

function jsonSchemaMiddleware() {
    return function (req, res, next) {
        var ljsReq  = new LJSRequest(req);
        var collectionName = ljsReq.collectionName;

        if (collectionName === "json-schemas") {
            return next();
        }

        JsonSchema.registerLoopbackModelForCollection(collectionName, req.app, function() {
            JsonSchema.findByCollectionName(ljsReq, next, function(jsonSchema) {
                jsonSchema.addHeaders(ljsReq, res);
            });
        });
    };
}

