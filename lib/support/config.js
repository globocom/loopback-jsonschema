var Model = require('loopback').PersistedModel;

var CollectionSchema = require('../domain/collection-schema');

var config = module.exports = {
    CollectionSchemaClass: CollectionSchema,
    jsonSchemaValidatorTranslation: { },
    logLevel: 'info',
    Model: Model,
    registerItemSchemaAtRequest: true
};

config.generatedId = true;
if (process.env['LOOPBACK_JSONSCHEMA_GENERATED_ID']) {
    config.generatedId = process.env['LOOPBACK_JSONSCHEMA_GENERATED_ID'] === 'true';
}