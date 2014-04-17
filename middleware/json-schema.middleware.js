/**
 * Module dependencies.
 */

var JsonSchema = require('../models/json-schema');

/**
 * Export the middleware.
 */

module.exports = jsonSchemaMiddleware;

function jsonSchemaMiddleware() {
    return function (req, res, next) {
        if (req.url.indexOf("/json-schemas") === 0) {
            return next();
        }
        var collectionName = req.url.split("/")[1];

        JsonSchema.registerLoopbackModelForCollection(collectionName, req.app, next);
    };
}

