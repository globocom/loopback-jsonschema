var debug = require('debug')('json-schema');

var loopback = require('loopback');

var logger = require('../support/logger')
var JsonSchema = require('../../lib/models/json-schema');
var LJSRequest = require('../../lib/models/ljs-request');
var LJSUrl = require('../../lib/models/ljs-url');

function CollectionSchema(ljsReq, id) {
    this.id = id;
    this.ljsReq = ljsReq;
};

CollectionSchema.pluralModelName = 'collection-schemas';

CollectionSchema.prototype.type = function() {
    return 'array';
}

CollectionSchema.prototype.items = function(itemSchemaUrl) {
    return { $ref: itemSchemaUrl };
}

CollectionSchema.prototype.properties = function(itemSchemaUrl) {
    return null;
}

CollectionSchema.prototype.links = function(collectionUrl) {
    return [
        { rel: 'self', href: collectionUrl }
    ];
}

CollectionSchema.prototype.data = function(callback) {
    var self = this;

    findBySchemaId(this.id, function(err, itemSchema) {
        var schema;

        if (itemSchema) {
            schema = {
                $schema: itemSchema.$schema,
                title: itemSchema.collectionTitle
            };

            var itemSchemaUrl = LJSUrl.buildFromModel(self.ljsReq, itemSchema).url;
            var collectionUrl = LJSUrl.buildFromCollectionName(self.ljsReq, itemSchema.collectionName).url;

            var type = self.type();
            if (type) {
                schema.type = type;
            }
            var items = self.items(itemSchemaUrl);
            if (items) {
                schema.items = items;
            }
            var properties = self.properties(itemSchemaUrl);
            if (properties) {
                schema.properties = properties;
            }
            var links = self.links(collectionUrl);
            if (links) {
                schema.links = links;
            }
        }

        callback(err, schema);
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

module.exports = CollectionSchema;
