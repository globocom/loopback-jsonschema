var Model = require('loopback').Model;

var CollectionSchema = require('../domain/collection-schema');

module.exports = {
    CollectionSchemaClass: CollectionSchema,
    logLevel: 'info',
    Model: Model
};
