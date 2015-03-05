var traverse = require('traverse');

var LJSUrl = require('../http/ljs-url');

module.exports = function schemaLinkRewriter(baseUrl, instance) {
    traverseProperties(baseUrl, instance.links, function(context) {
        return context.key === 'href' || context.key === '$ref';
    });

    traverseProperties(baseUrl, instance.properties, function(context) {
        return context.key === '$ref';
    });

    traverseProperties(baseUrl, instance.items, function(context) {
        return context.key === '$ref';
    });

    return instance;
};

function traverseProperties(baseUrl, properties, shouldUpdate) {
    traverse(properties).forEach(function(property) {
        if (shouldUpdate(this) && new LJSUrl(property).isRelative()) {
            this.update(baseUrl + property);
        }
    });
}
