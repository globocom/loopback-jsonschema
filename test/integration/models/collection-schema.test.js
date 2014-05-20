require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var loopbackJsonSchema = require('../../../index');
var JsonSchema = require('../../../lib/models/json-schema');
var CollectionSchema = require('../../../lib/models/collection-schema');
var LJSRequest = require('../../../lib/models/ljs-request');


var app = loopback();
app.set('restApiRoot', '/api');
loopbackJsonSchema.init(app);

describe('CollectionSchema', function() {
    describe('#data', function() {
        describe('when ItemSchema is found', function() {
            var collectionSchema, itemSchemaId;

            beforeEach(function (done) {
                var req = { body: 'body', protocol: 'http', url: '/people/alice' };
                req.get = this.sinon.stub();
                req.get.withArgs('Host').returns('example.org');
                var ljsReq = new LJSRequest(req, app);

                JsonSchema.create({
                    modelName: 'person',
                    collectionName: 'people',
                    title: 'Person',
                    collectionTitle: 'People',
                    type: 'object',
                    properties: {}
                }, function(err, itemSchema) {
                    if (err) { throw err };
                    itemSchemaId = itemSchema.id;
                    collectionSchema = new CollectionSchema(ljsReq, itemSchema.id);
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
                    expect(data.items.$ref).to.eq('http://example.org/api/json-schemas/' + itemSchemaId);
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

            it('should include links', function(done) {
                var callback = function(err, data) {
                    expect(data.links).to.eql([
                        {
                            rel: 'self',
                            href: 'http://example.org/api/people'
                        },
                        {
                            rel: 'add',
                            method: 'POST',
                            href: 'http://example.org/api/people',
                            schema: {
                                $ref: 'http://example.org/api/json-schemas/' + itemSchemaId
                            }
                        }
                    ]);
                    done();
                }

                collectionSchema.data(callback);
            });
        });

        describe('when ItemSchema is not found', function() {
            it('should return empty data', function (done) {
                var collectionSchema = new CollectionSchema(undefined, 'invalid-id');

                var callback = function(err, data){
                    expect(data).to.be.empty;
                    done();
                };

                collectionSchema.data(callback);
            });
        });
    });

    it('has a pluraModelName property', function () {
        expect(CollectionSchema.pluralModelName).to.eql('collection-schemas');
    });
});