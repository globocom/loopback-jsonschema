var config = require('../support/config');
var JsonSchema = require('../models/json-schema');
var logger = require('../support/logger');

function CollectionSchemaFactory() {}

CollectionSchemaFactory.buildFromSchemaId = function(schemaId, callback) {
    findBySchemaId(schemaId, function(err, itemSchema) {
        var collectionSchema;

        if (itemSchema) {
            collectionSchema = new config.CollectionSchemaClass(itemSchema);
        }

        callback(err, collectionSchema);
    });
};

function findBySchemaId(schemaId, callback) {
    JsonSchema.findById(schemaId, function(err, itemSchema) {
        if (err) {
            logger.error("Error fetching ItemSchema for schemaId:", schemaId, "Error:", err);
        } else if (itemSchema === null) {
            logger.info("Item Schema for schemaId", schemaId, "not found.");
        }
        callback(err, itemSchema);
    });
};

module.exports = CollectionSchemaFactory;