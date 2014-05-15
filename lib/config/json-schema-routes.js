var CollectionSchema = require('../models/collection-schema');

var jsonSchemaRoutes = module.exports = {};

jsonSchemaRoutes.draw = function(app) {

    app.get(app.get('restApiRoot') + "/collection-schemas/:schemaId" , function(req, res, next){
        var schemaId = req.param('schemaId');
        var collectionSchema = new CollectionSchema(schemaId);

        var callback = function(err, data){
            // res.json(data);
            next();
        };

        collectionSchema.data(callback);
    });

}
