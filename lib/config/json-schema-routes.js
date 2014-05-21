var CollectionSchemaFactory = require('../factory/collection-schema-factory');
var CollectionSchema = require('../models/collection-schema');
var logger = require('../support/logger');

var jsonSchemaRoutes = module.exports = {};

jsonSchemaRoutes.draw = function(app) {

    app.get(app.get('restApiRoot') + '/collection-schemas/:schemaId' , function(req, res, next) {
        var schemaId = req.param('schemaId');

        CollectionSchemaFactory.buildFromSchemaId(schemaId, function(err, collectionSchema) {

            if (collectionSchema) {
                var data = collectionSchema.data();
                res.json(data);
            } else {
                logger.warn('JsonSchema with id: ', schemaId, 'was not found.');
                next();
            }

        });
    });

};
