var schemaBodyUrlRewriter = require('../http/schema-body-url-rewriter');

var schemaRequest = module.exports = {
    handle: function(ljsReq, res) {
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
};
