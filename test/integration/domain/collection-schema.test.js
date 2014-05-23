require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var loopbackJsonSchema = require('../../../index');
var ItemSchema = require('../../../lib/models/item-schema');
var CollectionSchema = require('../../../lib/domain/collection-schema');
var LJSRequest = require('../../../lib/http/ljs-request');


var app = loopback();
app.set('restApiRoot', '/api');
loopbackJsonSchema.init(app);

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
                    collectionSchema = new CollectionSchema(itemSchema.id);
                    done();
                });
            });

            it('should include type array', function (done) {
                var callback = function(err, data) {
                    expect(data.type).to.eq('array');
                    done();
                };

                collectionSchema.data(callback);
            });

            it('should include "items" key pointing to itemSchema url', function (done) {
                var callback = function(err, data) {
                    expect(data.items.$ref).to.eq('/item-schemas/' + itemSchemaId);
                    done();
                };

                collectionSchema.data(callback);
            });

            it('should include $schema from ItemSchema', function (done) {
                var callback = function(err, data) {
                    expect(data.$schema).to.eq('http://json-schema.org/draft-04/hyper-schema#');
                    done();
                };

                collectionSchema.data(callback);
            });

            it('should use the property "collectionTitle" from ItemSchema as title', function (done) {
                var callback = function(err, data){
                    expect(data.title).to.eq('People');
                    done();
                };

                collectionSchema.data(callback);
            });

            it('should include default and custom links', function(done) {
                var callback = function(err, data) {
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
                            rel: 'custom',
                            href: '/custom'
                        }
                    ]);
                    done();
                }

                collectionSchema.data(callback);
            });
        });

        describe('when corresponding item schema does not exist', function() {
            it('should return empty data', function (done) {
                var collectionSchema = new CollectionSchema('invalid-id');

                var callback = function(err, data){
                    expect(data).to.be.empty;
                    done();
                };

                collectionSchema.data(callback);
            });
        });
    });

    describe('#url', function() {
        var collectionSchema, schemaId;

        beforeEach(function() {
            schemaId = 1;
            collectionSchema = new CollectionSchema(schemaId);
        });

        it('should return URL this collection schema', function() {
            expect(collectionSchema.url()).to.eq('/collection-schemas/' + schemaId);
        });
    });

    it('has a pluraModelName property', function () {
        expect(CollectionSchema.pluralModelName).to.eql('collection-schemas');
    });
});