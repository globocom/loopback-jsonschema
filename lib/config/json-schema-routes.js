var config = require('../support/config');
var LJSRequest = require('../models/ljs-request');
var logger = require('../support/logger');

var jsonSchemaRoutes = module.exports = {};

jsonSchemaRoutes.draw = function(app) {

    app.get(app.get('restApiRoot') + '/collection-schemas/:schemaId' , function(req, res, next) {
        var schemaId = req.param('schemaId');
        var ljsReq = new LJSRequest(req, app);
        var collectionSchema = new config.CollectionSchemaClass(ljsReq, schemaId);

        var callback = function(err, data) {
            if (data) {
                res.json(data);
            } else {
                logger.warn('JsonSchema with id: ', schemaId, 'was not found.');
                next();
            }
        };

        collectionSchema.data(callback);
    });

};
