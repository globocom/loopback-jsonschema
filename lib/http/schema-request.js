var schemaBodyUrlRewriter = require('../http/schema-body-url-rewriter');

var schemaRequest = module.exports = {
    handle: function(ljsReq, res) {
        var send = res.send;
        res.send = function(bodyString) {
            var originalBody;
            try {
                originalBody = JSON.parse(bodyString);
            } catch (SyntaxError) {
                originalBody = bodyString;
            }
            var body = schemaBodyUrlRewriter.makeAbsolute(ljsReq, originalBody);
            send.call(this, JSON.stringify(body));
        };
    }
};
