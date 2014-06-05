/**
 * Module dependencies.
 */

var LJSRequest = require('../http/ljs-request');
var logger = require('../support/logger');
var instanceRequest = require('../http/instance-request');
var schemaRequest = require('../http/schema-request');

/**
 * Export the middleware.
 */

module.exports = jsonSchemaMiddleware;

function jsonSchemaMiddleware() {
    return function(req, res, next) {
        var ljsReq = new LJSRequest(req, req.app);
        var ljsUrl = ljsReq.ljsUrl();

        logger.info('Request headers:', ljsReq.safeHeaders());

        if (ljsUrl.isSchema()) {
            schemaRequest.handle(ljsReq, res);
            next();
        } else if (ljsUrl.isInstance()) {
            instanceRequest.handle(ljsReq, res, function(err) {
                if (err) { throw err; }
                next();
            });
        } else {
            next();
        }
    };
}
