var LJSRequest = require('./ljs-request');
var querystring = require('querystring');

var CollectionSchema = require('../domain/collection-schema');
var ItemSchema = require('../domain/item-schema');

module.exports = {
    collection: function correlateCollection (collectionName, params, ctx, result, next) {
        // params is optional
        if (next === undefined) {
            next = result;
            result = ctx;
            ctx = params;
            params = null;
        }
        var baseUrl = new LJSRequest(ctx.req, ctx.req.app).baseUrl();
        var schemaUrl = CollectionSchema.urlForCollectionName(collectionName);

        injectSchemaHeaders(baseUrl + schemaUrl, ctx.res, params);
        next();
    },
    instance: function correlateInstance (collectionName, params, ctx, result, next) {
        // params is optional
        if (next === undefined) {
            next = result;
            result = ctx;
            ctx = params;
            params = null;
        }

        var baseUrl = new LJSRequest(ctx.req, ctx.req.app).baseUrl();
        var schemaUrl = ItemSchema.urlForCollectionName(collectionName);
        injectSchemaHeaders(baseUrl + schemaUrl, ctx.res, params);
        next();
    }
};

function injectSchemaHeaders(schemaUrl, res, params) {
    var url;

    if (params) {
        url = schemaUrl + '?' + querystring.stringify(params);
    } else {
        url = schemaUrl;
    }

    res.set('Content-Type', 'application/json; charset=utf-8; profile="' + url + '"');
    res.set('Link', '<' + url + '>; rel="describedby"');
}
