var cors = require('cors');
var Router = require('loopback').Router;

var CollectionSchemaFactory = require('../../lib/domain/collection-schema-factory');

module.exports = {
    drawRouter: function(corsOptions) {
        var router = Router();

        router
            .options('/collection-schemas/:schemaId', cors(corsOptions))
            .get('/collection-schemas/:schemaId', cors(corsOptions), function(req, res, next) {
                var schemaId = req.param('schemaId');

                CollectionSchemaFactory.buildFromSchemaId(schemaId, function(err, collectionSchema) {
                    if (err) { return next(err); }

                    if (collectionSchema === null) {
                        return next();
                    }

                    var data = collectionSchema.data();
                    res.json(data);
                });
            });

        return router;
    }
};
