var logger = require('../support/logger');
var LJSRequest = require('../http/ljs-request');
var registerLoopbackModel = require('../http/register-loopback-model');

module.exports = function registerLoopbackModelMiddleware() {
    return function registerLoopbackModelHandler(req, res, next) {
        logger.debug('Entered registerLoopbackModelMiddleware.');

        logger.debug('req.method:', req.method);
        logger.debug('req.originalUrl:', req.originalUrl);
        logger.debug('req.body:', JSON.stringify(req.body));

        var ljsReq = new LJSRequest(req, req.app);
        if (ljsReq.method === "OPTIONS") {
            return next();
        }

        logger.info('Request headers:', ljsReq.safeHeaders());

        var ljsUrl = ljsReq.ljsUrl();
        if (!ljsUrl.isInstance()) {
            return next();
        }

        registerLoopbackModel.handle(ljsReq, function(err) {
            if (err) { return next(err); }
            return next();
        });
    };
};
