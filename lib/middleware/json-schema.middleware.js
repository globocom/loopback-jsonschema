/**
 * Module dependencies.
 */

var JsonSchema = require('../models/json-schema');
var LJSRequest = require('../models/ljs-request');
var JsonSchemaService = require('../service/json-schema.service');

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

        var jsonSchemaService = new JsonSchemaService(ljsReq, res);
        jsonSchemaService.build(next);
    };
}