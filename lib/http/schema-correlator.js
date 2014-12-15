var LJSRequest = require('./ljs-request');
var ItemSchema = require('../domain/item-schema');

module.exports = {
    correlateCollection: function correlateCollection (collectionName, ctx, next) {

        ItemSchema.findByCollectionName(collectionName, function(err, itemSchema) {
            if (err) { return next(err); }

            if (itemSchema === null) {
                return next();
            }

            var baseUrl = new LJSRequest(ctx.req, ctx.req.app).baseUrl();
            var schemaUrl = itemSchema.collectionSchema().url();
            injectSchemaHeaders(baseUrl + schemaUrl, ctx.res);
            next();
        });
    },
    correlateInstance: function correlateInstance (collectionName, ctx, next) {
        ItemSchema.findByCollectionName(collectionName, function(err, itemSchema) {
            if (err) { return next(err); }

            if (itemSchema === null) {
                return next();
            }

            var baseUrl = new LJSRequest(ctx.req, ctx.req.app).baseUrl();
            var schemaUrl = itemSchema.url();
            injectSchemaHeaders(baseUrl + schemaUrl, ctx.res);
            next();
        });
    }
};

function injectSchemaHeaders(schemaUrl, res) {
    res.set('Content-Type', 'application/json; charset=utf-8; profile="' + schemaUrl + '"');
    res.set('Link', '<' + schemaUrl + '>; rel="describedby"');
}
