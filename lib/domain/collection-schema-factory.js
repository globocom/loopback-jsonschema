var config = require('../support/config');
var ItemSchema = require('./item-schema');
var logger = require('../support/logger');

function CollectionSchemaFactory() {}

CollectionSchemaFactory.buildFromSchemaId = function(schemaId, navigationRoot, callback) {
    ItemSchema.findById(schemaId, function(err, itemSchema) {
        if (err) { return callback(err); }

        if (itemSchema === null) {
            logger.info("Item Schema for schemaId", schemaId, "not found.");
            return callback(null, null);
        }

        var collectionSchema = new config.CollectionSchemaClass(itemSchema, navigationRoot);

        callback(null, collectionSchema);
    });
};

module.exports = CollectionSchemaFactory;
