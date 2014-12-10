
var ItemSchema = require('../domain/item-schema');

var LJSRequest = require('./ljs-request');
var schemaLinkRewriter = require('./schema-link-rewriter');

module.exports = {
    initialize: function() {
        ItemSchema.afterRemote('**', function setContentTypeHeader (ctx, instance, next) {
            ctx.res.set('Content-Type', 'application/schema+json; charset=utf-8');
            next();
        });

        var remotes = ['findById', 'upsert', 'create', 'prototype.updateAttributes'];

        remotes.forEach(function(remote) {
            ItemSchema.afterRemote(remote, function(ctx, instance, next) {
                if (instance) {
                    var baseUrl = new LJSRequest(ctx.req, ctx.req.app).baseUrl();
                    schemaLinkRewriter(baseUrl, instance);
                }

                next();
            });
        });

        ItemSchema.afterRemote('find', function(ctx, items, next) {
            var baseUrl = new LJSRequest(ctx.req, ctx.req.app).baseUrl();

            for (var i=0; i<items.length; i++) {
                schemaLinkRewriter(baseUrl, items[i]);
            }

            next();
        });
    }
};
