var cors = require('cors');

var config = require('../support/config');
var LJSRequest = require('../http/ljs-request');
var logger = require('../support/logger');
var CollectionSchemaFactory = require('../../lib/domain/collection-schema-factory');

module.exports = {
    draw: function(app) {
        var corsOptions = (app.get('remoting') && app.get('remoting').cors) || {};

        app.options(app.get('restApiRoot') + '/collection-schemas/:schemaId', cors(corsOptions));

        app.get(app.get('restApiRoot') + '/collection-schemas/:schemaId', cors(corsOptions), function(req, res, next) {
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
    }
};
