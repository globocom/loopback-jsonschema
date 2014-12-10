var LJSRequest = require('../http/ljs-request');
var logger = require('../support/logger');
var instanceRequest = require('../http/instance-request');

module.exports = function jsonSchemaMiddleware() {
    return function jsonSchemaMiddlewareHandler(req, res, next) {
        var ljsReq = new LJSRequest(req, req.app);

        if (ljsReq.method === "OPTIONS") {
            return next();
        }

        var ljsUrl = ljsReq.ljsUrl();
        if (!ljsUrl.isSchema() && ljsUrl.isInstance()) {
            instanceRequest.handle(ljsReq, res, function(err) {
                if (err) { return next(err); }
                next();
            });
        } else {
            next();
        }
    };
};
