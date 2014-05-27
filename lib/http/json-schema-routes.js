var cors = require('cors');

var config = require('../support/config');
var LJSRequest = require('../http/ljs-request');
var logger = require('../support/logger');

var jsonSchemaRoutes = module.exports = {};

jsonSchemaRoutes.draw = function(app) {
    var corsOptions = (app.get('remoting') && app.get('remoting').cors) || {};

    app.options(app.get('restApiRoot') + '/collection-schemas/:schemaId', cors(corsOptions));

    app.get(app.get('restApiRoot') + '/collection-schemas/:schemaId', cors(corsOptions), function(req, res, next) {
        var schemaId = req.param('schemaId');
        var ljsReq = new LJSRequest(req, app);
        var collectionSchema = new config.CollectionSchemaClass(schemaId);

        var callback = function(err, data) {
            if (data) {
                res.json(data);
            } else {
                logger.warn('ItemSchema with id: ', schemaId, 'was not found.');
                next();
            }
        };

        collectionSchema.data(callback);
    });
};
