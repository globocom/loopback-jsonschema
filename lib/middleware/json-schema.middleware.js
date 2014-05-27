/**
 * Module dependencies.
 */

var schemaBodyUrlRewriter = require('../http/schema-body-url-rewriter');
var LJSRequest = require('../http/ljs-request');
var instanceRequest = require('../http/instance-request');

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
            instanceRequest.handle(ljsReq, res, function(err) {
                if (err) { throw err; }
                next();
            });
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