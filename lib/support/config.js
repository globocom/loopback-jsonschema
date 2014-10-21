var Model = require('loopback').PersistedModel;

var CollectionSchema = require('../domain/collection-schema');

module.exports = {
    CollectionSchemaClass: CollectionSchema,
    jsonSchemaValidatorTranslation: { },
    registerItemSchemaAtRequest: true,
    logLevel: 'info',
    Model: Model
};
