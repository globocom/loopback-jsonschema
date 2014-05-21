var debug = require('debug')('json-schema');

var loopback = require('loopback');

var JsonSchema = require('../../lib/models/json-schema');
var JsonSchemaLinks = require('../../lib/models/json-schema-links');
var LJSUrl = require('../../lib/models/ljs-url');
var logger = require('../support/logger');

function CollectionSchema(itemSchema) {
    this.itemSchema = itemSchema;
};

CollectionSchema.pluralModelName = 'collection-schemas';

CollectionSchema.prototype.type = function() {
    return 'array';
}

CollectionSchema.prototype.items = function() {
    var itemSchemaUrl = this.itemSchema.buildSchemaUri();
    return { $ref: itemSchemaUrl };
}

CollectionSchema.prototype.properties = function() {
    return null;
}

CollectionSchema.prototype.links = function(customLinks, collectionUrl) {
    var itemSchemaUrl = this.itemSchema.buildSchemaUri();

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

    var links = new JsonSchemaLinks(defaultLinks, customLinks);
    return links.all();
}

CollectionSchema.prototype.data = function(callback) {
    var schema = {
        $schema: this.itemSchema.$schema,
        title: this.itemSchema.collectionTitle
    };

    var itemSchemaUrl = this.itemSchema.buildSchemaUri();
    var collectionUrl = '/'+ this.itemSchema.collectionName;
    var customLinks = this.itemSchema.collectionLinks;

    var type = this.type();
    if (type) {
        schema.type = type;
    }
    var items = this.items(itemSchemaUrl);
    if (items) {
        schema.items = items;
    }
    var properties = this.properties(itemSchemaUrl);
    if (properties) {
        schema.properties = properties;
    }
    var links = this.links(customLinks, collectionUrl);
    if (links) {
        schema.links = links;
    }

    return schema;
};

CollectionSchema.prototype.buildSchemaUri = function() {
    return '/collection-schemas/' + this.itemSchema.id;
};

module.exports = CollectionSchema;