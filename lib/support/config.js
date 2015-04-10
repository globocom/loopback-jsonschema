var Model = require('loopback').PersistedModel;

var CollectionSchema = require('../domain/collection-schema');
var logger = require('./logger');

var config = module.exports = {
    CollectionSchemaClass: CollectionSchema,
    jsonSchemaValidatorTranslation: { },
    Model: Model,
    registerItemSchemaAtRequest: true,
    registerItemSchemaMaxAttempts: 5,
    registerItemSchemaAttemptDelay: 200,
    collectionRemoteName: 'find',
    instanceRemoteNames: ['findById', 'findOne', 'upsert', 'create', 'prototype.updateAttributes', 'prototype.delete', 'deleteById']
};

config.generatedId = true;
if (process.env['LOOPBACK_JSONSCHEMA_GENERATED_ID']) {
    config.generatedId = process.env['LOOPBACK_JSONSCHEMA_GENERATED_ID'] === 'true';
}

if (logger.debug.enabled) {
    logger.debug('config: ', JSON.stringify(config, null, 2));
}
