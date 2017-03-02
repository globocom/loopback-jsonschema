var debug = require('debug')('json-schema');

var Links = require('./links');
var logger = require('../support/logger');

function CollectionSchema(itemSchema, navigationRoot) {
    this.itemSchema = itemSchema;
    this.navigationRoot = navigationRoot || '';
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

CollectionSchema.prototype.defaultLinks = function(itemSchemaUrl) {
    var collectionUrl = this.itemSchema.collectionUrl();
    var collectionNavigationUrl = collectionUrl + this.navigationRoot;

    return [
        {
            rel: 'self',
            href: collectionNavigationUrl
        },
        {
            rel: 'list',
            href: collectionNavigationUrl
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
            href: collectionNavigationUrl + '?filter[limit]={limit}&filter[offset]={previousOffset}{&paginateQs*}'
        },
        {
            rel: 'next',
            href: collectionNavigationUrl + '?filter[limit]={limit}&filter[offset]={nextOffset}{&paginateQs*}'
        },
        {
            rel: 'page',
            href: collectionNavigationUrl + '?filter[limit]={limit}&filter[offset]={offset}{&paginateQs*}'
        },
        {
            rel: 'order',
            href: collectionNavigationUrl + '?filter[order]={orderAttribute}%20{orderDirection}{&orderQs*}'
        }
    ];
};

CollectionSchema.prototype.links = function(customLinks, itemSchemaUrl) {
    var links = new Links(this.defaultLinks(itemSchemaUrl), [], customLinks);
    return links.all();
};

CollectionSchema.prototype.data = function() {
    var schema;

    if (this.itemSchema) {
        schema = {
            $schema: this.itemSchema.$schema,
            collectionName: this.itemSchema.collectionName,
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
    return CollectionSchema.urlForCollectionName(this.itemSchema.collectionName);
};

CollectionSchema.urlForCollectionName = function urlForCollectionName (collectionName) {
    return '/' + CollectionSchema.pluralModelName + '/' + collectionName;
};

CollectionSchema.urlV2ForCollectionName = function urlV2ForCollectionName (collectionName) {
    return '/v2/' + CollectionSchema.pluralModelName + '/' + collectionName;
};

module.exports = CollectionSchema;
