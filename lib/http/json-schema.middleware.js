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
    return function jsonSchemaMiddlewareHandler(req, res, next) {
        logger.debug('req.method:', req.method);
        logger.debug('req.originalUrl:', req.originalUrl);
        logger.debug('req.body:', req.body);

        var ljsReq = new LJSRequest(req, req.app);

        if (ljsReq.method === "OPTIONS") {
            return next();
        }

        logger.info('Request headers:', ljsReq.safeHeaders());

        if (!ljsReq.isContentTypeSupported()) {
            var errMessage = 'Unsupported Content-Type: <' + req.headers['content-type'] + '>.';
            var err = new Error(errMessage);
            err.status = 415;
            return next(err);
        }

        var ljsUrl = ljsReq.ljsUrl();
        if (ljsUrl.isSchema()) {
            schemaRequest.handle(ljsReq, res);
            next();
        } else if (ljsUrl.isInstance()) {
            instanceRequest.handle(ljsReq, res, function(err) {
                if (err) { return next(err); }
                next();
            });
        } else {
            next();
        }
    };
}
