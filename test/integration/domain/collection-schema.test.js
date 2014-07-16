var support = require('../../support');

var expect = require('chai').expect;

var ItemSchema = require('../../../lib/domain/item-schema');
var CollectionSchema = require('../../../lib/domain/collection-schema');
var LJSRequest = require('../../../lib/http/ljs-request');

var app = support.newLoopbackJsonSchemaApp();

describe('CollectionSchema', function() {
    describe('#data', function() {
        describe('when corresponding item schema exists', function() {
            var collectionSchema, itemSchemaId;

            beforeEach(function (done) {
                ItemSchema.create({
                    modelName: 'person',
                    collectionName: 'people',
                    title: 'Person',
                    collectionTitle: 'People',
                    type: 'object',
                    properties: {},
                    collectionLinks: [
                        { rel: 'custom', href: '/custom' }
                    ]
                }, function(err, itemSchema) {
                    if (err) { throw err };
                    itemSchemaId = itemSchema.id;
                    collectionSchema = new CollectionSchema(itemSchema);
                    done();
                });
            });

            it('should include type array', function () {
                var data = collectionSchema.data();
                expect(data.type).to.eq('array');
            });

            it('should include "items" key pointing to itemSchema url', function () {
                var data = collectionSchema.data();
                expect(data.items.$ref).to.eq('/item-schemas/' + itemSchemaId);
            });

            it('should include $schema from ItemSchema', function () {
                var data = collectionSchema.data();
                expect(data.$schema).to.eq('http://json-schema.org/draft-04/hyper-schema#');
            });

            it('should use the property "collectionTitle" from ItemSchema as title', function () {
                var data = collectionSchema.data();
                expect(data.title).to.eq('People');
            });

            it('should include default and custom links', function() {
                var data = collectionSchema.data();
                expect(data.links).to.eql([
                    {
                        rel: 'self',
                        href: '/people'
                    },
                    {
                        rel: 'add',
                        method: 'POST',
                        href: '/people',
                        schema: {
                            $ref: '/item-schemas/' + itemSchemaId
                        }
                    },
                    {
                        rel: 'previous',
                        href: '/people?filter[limit]={limit}&filter[offset]={previousOffset}&{+paginateQs}'
                    },
                    {
                        rel: 'next',
                        href: '/people?filter[limit]={limit}&filter[offset]={nextOffset}&{+paginateQs}'
                    },
                    {
                        rel: 'order',
                        href: '/people?filter[order]={orderAttribute} {orderDirection}&{+orderQs}'
                    },
                    {
                        rel: 'custom',
                        href: '/custom'
                    }
                ]);
            });
        });
    });

    describe('#url', function() {
        var collectionSchema, schema;

        beforeEach(function() {
            schema = { id: 1 };
            collectionSchema = new CollectionSchema(schema);
        });

        it('should return URL this collection schema', function() {
            expect(collectionSchema.url()).to.eq('/collection-schemas/' + schema.id);
        });
    });

    it('has a pluraModelName property', function () {
        expect(CollectionSchema.pluralModelName).to.eql('collection-schemas');
    });
});