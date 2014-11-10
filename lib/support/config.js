var Model = require('loopback').PersistedModel;

var CollectionSchema = require('../domain/collection-schema');

module.exports = {
    CollectionSchemaClass: CollectionSchema,
    generatedId: true,
    jsonSchemaValidatorTranslation: { },
    logLevel: 'info',
    Model: Model,
    registerItemSchemaAtRequest: true
};
