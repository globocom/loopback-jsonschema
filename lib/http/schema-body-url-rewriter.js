var util = require('util');
var parseUrl = require('url').parse;

var traverse = require('traverse');

var logger = require('../support/logger');

var schemaBodyUrlRewriter = module.exports = {
    makeAbsolute: function(ljsReq, originalBody) {
        var baseUrl = ljsReq.baseUrl();

        logger.debug('baseUrl:', baseUrl);

        var body;
        if (util.isArray(originalBody)) {
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

        traverse(schema.properties).forEach(function(property) {
            if (this.key === '$ref') {
                if (isRelative(property)) {
                    this.update(baseUrl + property);
                }
            }
        });
    });
    return schemasAbsolute;
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
