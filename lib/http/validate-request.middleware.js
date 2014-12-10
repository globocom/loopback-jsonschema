var LJSRequest = require('../http/ljs-request');
var logger = require('../support/logger');
var instanceRequest = require('../http/instance-request');


module.exports = function validateRequestMiddleware() {
    return function validateRequestHandler(req, res, next) {
        var ljsReq = new LJSRequest(req, req.app);

        if (ljsReq.method === "OPTIONS") {
            return next();
        }

        if (!ljsReq.isContentTypeSupported()) {
            var errMessage = 'Unsupported Content-Type: <' + req.headers['content-type'] + '>.';
            var err = new Error(errMessage);
            err.status = 415;
            return next(err);
        }
        next();
    };
};
