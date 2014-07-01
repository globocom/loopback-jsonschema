var Model = require('loopback').Model;

var CollectionSchema = require('../domain/collection-schema');

module.exports = {
    CollectionSchemaClass: CollectionSchema,
    jsonSchemaValidatorTranslation: { },
    logLevel: 'info',
    Model: Model
};
