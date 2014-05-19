var debug = require('debug')('json-schema');

var loopback = require('loopback');
var Model = require('loopback').Model;

var logger = require('../support/logger')
var JsonSchema = require('../../lib/models/json-schema');
var LJSRequest = require('../../lib/models/ljs-request');
var LJSUrl = require('../../lib/models/ljs-url');

function CollectionSchema(ljsReq, schemaId) {
    this.schemaId = schemaId;
    this.ljsReq = ljsReq;
    this.pluralModelName = 'collection-schemas';
};

CollectionSchema.prototype.type = function() {
    return 'array';
}

CollectionSchema.prototype.items = function(itemSchemaUrl) {
    return { $ref: itemSchemaUrl };
}

CollectionSchema.prototype.properties = function(itemSchemaUrl) {
    return null;
}

CollectionSchema.prototype.links = function() {
    return [];
}

CollectionSchema.prototype.data = function(callback) {
    var self = this;

    findBySchemaId(this.schemaId, function(err, itemSchema) {
        var schema;

        if (itemSchema) {
            schema = {
                $schema: itemSchema.$schema,
                title: itemSchema.collectionTitle
            };

            var itemSchemaUrl = buildItemSchemaUrl(self.ljsReq, itemSchema);

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
            var links = self.links();
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

function buildItemSchemaUrl(ljsReq, itemSchema) {
    var ljsUrl = LJSUrl.buildFromModel(ljsReq, itemSchema);

    return ljsUrl.url;
};

module.exports = CollectionSchema;