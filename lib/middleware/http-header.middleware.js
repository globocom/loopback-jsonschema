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
        var paths = req.url.split("/");
        var collectionName = paths[1];
        var resource = paths[2];

        if ((req.url.indexOf("/json-schemas") === 0) || _.isEmpty(resource)) {
            return next();
        }

        var ljsReq  = new LJSRequest(req);
        var baseUrl = ljsReq.baseUrl();

        var js = JsonSchema.findOne({ where: { collectionName: collectionName }}, function(err, jsonSchema) {
            if (err) {
                console.error("HTTP Header: Error fetching JSON Schema for collectionName:", collectionName, "Error:", err);
            } else if (jsonSchema === null) {
                console.warn("HTTP Header: JSON Schema for collectionName", collectionName, "not found.");
            } else {

                var jsonSchemaId = jsonSchema.id;
                var schemaLink   = baseUrl + '/json-schemas/' + jsonSchemaId;
                res.set("Content-Type", "application/json; profile='"+ schemaLink +"'");
                res.set('Link', '<' + schemaLink + '>; rel=describedby');
            }
        });

        next();
    };
}