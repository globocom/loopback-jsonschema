var debug = require('debug')('json-schema');

var loopback = require('loopback');

var config = require('../support/config');
var ItemSchema = require('../../lib/models/item-schema');
var Links = require('./links');
var LJSRequest = require('../../lib/models/ljs-request');
var LJSUrl = require('../../lib/models/ljs-url');
var logger = require('../support/logger');

function CollectionSchema(ljsReq, id) {
    this.ljsReq = ljsReq;
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
    var links = new Links(this.ljsReq, defaultLinks, customLinks);
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

            var itemSchemaUrl = LJSUrl.buildFromModel(self.ljsReq, itemSchema).url;
            var collectionUrl = LJSUrl.buildFromCollectionName(self.ljsReq, itemSchema.collectionName).url;
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
