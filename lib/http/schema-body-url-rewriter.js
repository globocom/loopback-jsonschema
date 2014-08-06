var util = require('util');

var traverse = require('traverse');
var _ = require('underscore');

var LJSUrl = require('../http/ljs-url');
var logger = require('../support/logger');

var schemaBodyUrlRewriter = module.exports = {
    makeAbsolute: function(ljsReq, originalBody) {
        var baseUrl = ljsReq.baseUrl();

        logger.debug('baseUrl:', baseUrl);

        var body;
        if (_.isEmpty(originalBody)) {
            body = null;
        } else if (util.isArray(originalBody)) {
            body = makeSchemasAbsolute.call(this, baseUrl, originalBody);
        } else {
            body = makeSchemasAbsolute.call(this, baseUrl, [originalBody])[0];
        }

        return body;
    }
};

function makeSchemasAbsolute(baseUrl, schemas) {
    var schemasAbsolute = traverse.clone(schemas);

    schemasAbsolute.forEach(function(schema) {
        traverseProperties(baseUrl, schema.links, function(context) {
            return context.key === 'href' || context.key === '$ref';
        });

        traverseProperties(baseUrl, schema.properties, function(context) {
            return context.key === '$ref';
        });

        traverseProperties(baseUrl, schema.items, function(context) {
            return context.key === '$ref';
        });
    });
    return schemasAbsolute;
}

function traverseProperties(baseUrl, properties, shouldUpdate) {
    traverse(properties).forEach(function(property) {
        if (shouldUpdate(this) && new LJSUrl(property).isRelative()) {
            this.update(baseUrl + property);
        }
    });
}
