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

        var baseUrl = ljsReq.baseUrl();

        var js = JsonSchema.findOne({ where: { collectionName: collectionName }}, function(err, jsonSchema) {
            if (err) {
                console.error("HTTP Header: Error fetching JSON Schema for collectionName:", collectionName, "Error:", err);
            } else if (jsonSchema === null) {
                console.warn("HTTP Header: JSON Schema for collectionName", collectionName, "not found.");
            } else {
                jsonSchema.addHeaders(ljsReq, res);
            }
        });

        next();
    };
}