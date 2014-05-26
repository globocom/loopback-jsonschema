var debug = require('debug')('json-schema');

var loopback = require('loopback');

var config = require('../support/config');
var ItemSchema = require('../../lib/domain/item-schema');
var Links = require('./links');
var logger = require('../support/logger');

function CollectionSchema(id) {
    this.id = id;
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

CollectionSchema.prototype.links = function(customLinks, itemSchemaUrl, collectionUrl) {
    var defaultLinks = [
        {
            rel: 'self',
            href: collectionUrl
        },
        {
            rel: 'add',
            method: 'POST',
            href: collectionUrl,
            schema: {
                $ref: itemSchemaUrl
            }
        }
    ];
    var links = new Links(defaultLinks, customLinks);
    return links.all();
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

            var itemSchemaUrl = itemSchema.url();
            var collectionUrl = itemSchema.collectionUrl();
            var customLinks = itemSchema.collectionLinks;

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
            var links = self.links(customLinks, itemSchemaUrl, collectionUrl);
            if (links) {
                schema.links = links;
            }
        }

        callback(err, schema);
    });
};

CollectionSchema.prototype.url = function() {
    return '/' + this.constructor.pluralModelName + '/' + this.id;
};


function findBySchemaId(schemaId, callback) {
    ItemSchema.findById(schemaId, function(err, itemSchema) {
        if (err) {
            logger.error("Error fetching ItemSchema for schemaId:", schemaId, "Error:", err);
        } else if (itemSchema === null) {
            logger.info("Item Schema for schemaId", schemaId, "not found.");
        }
        callback(err, itemSchema);
    });
};

module.exports = CollectionSchema;
