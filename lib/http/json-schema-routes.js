var cors = require('cors');
var Router = require('loopback').Router;

var CollectionSchemaFactory = require('../../lib/domain/collection-schema-factory');
var schemaLinkRewriter = require('./schema-link-rewriter');
var LJSRequest = require('./ljs-request');

module.exports = {
    drawRouter: function(corsOptions) {
        var router = Router();

        router
            .options('/collection-schemas/:schemaId', cors(corsOptions))
            .get('/collection-schemas/:schemaId', cors(corsOptions), function(req, res, next) {

                var schemaId = req.param('schemaId');
                var navigationRoot = req.query.navigationRoot;
                var baseUrl = new LJSRequest(req, req.app).baseUrl();

                CollectionSchemaFactory.buildFromSchemaId(schemaId, navigationRoot, function(err, collectionSchema) {
                    if (err) { return next(err); }

                    if (collectionSchema === null) {
                        var error = new Error('Unknown "collection-schema" id "'+schemaId+'"');
                        error.status = 404;
                        error.statusCode = 404;
                        return next(error);
                    }

                    var data = collectionSchema.data();
                    schemaLinkRewriter(baseUrl, data);
                    res.set('Content-Type', 'application/schema+json; charset=utf-8');
                    res.json(data);
                });
            });

        return router;
    }
};
