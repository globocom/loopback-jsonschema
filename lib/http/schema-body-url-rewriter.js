var parseUrl = require('url').parse;
var traverse = require('traverse');

var schemaBodyUrlRewriter = module.exports = {
    makeAbsolute: function(ljsReq, originalBody) {
        var baseUrl = ljsReq.baseUrl();
        var body = traverse.clone(originalBody);

        traverseProperties(baseUrl, body.links, function(context) {
            return context.key === 'href' || context.key === '$ref';
        });

        traverseProperties(baseUrl, body.properties, function(context) {
            return context.key === '$ref';
        });

        traverse(body.properties).forEach(function(property) {
            if (this.key === '$ref') {
                if (isRelative(property)) {
                    this.update(baseUrl + property);
                }
            }
        });

        return body;
    }
};

function traverseProperties(baseUrl, properties, shouldUpdate) {
    traverse(properties).forEach(function(property) {
        if (shouldUpdate(this) && isRelative(property)) {
            this.update(baseUrl + property);
        }
    });
};

function isRelative(url) {
    return !parseUrl(url).host;
};
