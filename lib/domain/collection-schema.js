var debug = require('debug')('json-schema');

var Links = require('./links');
var logger = require('../support/logger');

function CollectionSchema(itemSchema) {
    this.itemSchema = itemSchema;
}

CollectionSchema.pluralModelName = 'collection-schemas';

CollectionSchema.prototype.type = function() {
    return 'array';
};

CollectionSchema.prototype.items = function(itemSchemaUrl) {
    return { $ref: itemSchemaUrl };
};

CollectionSchema.prototype.properties = function(itemSchemaUrl) {
    return null;
};

CollectionSchema.prototype.links = function(customLinks, itemSchemaUrl) {
    var collectionUrl = this.itemSchema.collectionUrl();
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
        },
        {
            rel: 'previous',
            href: collectionUrl + '?filter[limit]={limit}&filter[offset]={previousOffset}{&paginateQs*}'
        },
        {
            rel: 'next',
            href: collectionUrl + '?filter[limit]={limit}&filter[offset]={nextOffset}{&paginateQs*}'
        },
        {
            rel: 'page',
            href: collectionUrl + '?filter[limit]={limit}&filter[offset]={offset}{&paginateQs*}'
        },
        {
            rel: 'order',
            href: collectionUrl + '?filter[order]={orderAttribute}%20{orderDirection}{&orderQs*}'
        }
    ];
    var links = new Links(defaultLinks, customLinks);
    return links.all();
};

CollectionSchema.prototype.data = function() {
    var schema;

    if (this.itemSchema) {
        schema = {
            $schema: this.itemSchema.$schema,
            modelName: this.itemSchema.modelName,
            title: this.itemSchema.collectionTitle
        };

        var itemSchemaUrl = this.itemSchema.url();
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
        var links = this.links(customLinks, itemSchemaUrl);
        if (links) {
            schema.links = links;
        }
    }

    return schema;
};

CollectionSchema.prototype.url = function() {
    return '/' + this.constructor.pluralModelName + '/' + this.itemSchema.resourceId;
};

module.exports = CollectionSchema;
