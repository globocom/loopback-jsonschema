/**
 * Module dependencies.
 */

var schemaBodyUrlRewriter = require('../http/schema-body-url-rewriter');
var LJSRequest = require('../http/ljs-request');
var InstanceService = require('../service/instance.service');

/**
 * Export the middleware.
 */

module.exports = jsonSchemaMiddleware;

function jsonSchemaMiddleware() {
    return function(req, res, next) {
        var ljsReq  = new LJSRequest(req, req.app);
        var ljsUrl = ljsReq.ljsUrl();

        if (ljsUrl.isSchema()) {
            makeLinksAbsolute(ljsReq, res);
            next();
        } else {
            var instanceService = new InstanceService(ljsReq, res);
            instanceService.build(next);
        }
    };
}

function makeLinksAbsolute(ljsReq, res) {
    var send = res.send;
        res.send = function(bodyString) {
            var body;
            try {
                body = JSON.parse(bodyString);
            } catch (SyntaxError) {
                body = bodyString;
            }
            schemaBodyUrlRewriter.makeAbsolute(ljsReq, body);
            send.call(this, JSON.stringify(body));
        };
}