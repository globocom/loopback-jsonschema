/**
 * Module dependencies.
 */

var linksRewriter = require('../http/links-rewriter');
var LJSRequest = require('../http/ljs-request');
var InstanceService = require('../service/instance.service');

/**
 * Export the middleware.
 */

module.exports = jsonSchemaMiddleware;

function jsonSchemaMiddleware() {
    return function(req, res, next) {
        var ljsReq  = new LJSRequest(req, req.app);
        var collectionName = ljsReq.ljsUrl().collectionName;
        if (collectionName === "item-schemas" || collectionName === "collection-schemas") {
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
            linksRewriter.makeAbsolute(ljsReq, body.links);
            linksRewriter.makeAbsolute(ljsReq, body.properties);
            send.call(this, JSON.stringify(body));
        };
}