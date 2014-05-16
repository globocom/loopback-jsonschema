require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var loopbackJsonSchema = require('../../../index');
var JsonSchema = require('../../../lib/models/json-schema');
var CollectionSchema = require('../../../lib/models/collection-schema');
var LJSRequest = require('../../../lib/models/ljs-request');


var app = loopback();
app.set('restApiRoot', '/api');
loopbackJsonSchema.initLoopbackJsonSchema(app);

describe('CollectionSchema', function() {

    describe('#data', function() {
        describe('when ItemSchema is found', function() {
            var itemSchema;

            beforeEach(function (done) {
                JsonSchema.create({
                    modelName: 'person',
                    collectionName: 'people',
                    title: 'Person',
                    collectionTitle: 'People',
                    type: 'object',
                    properties: {}
                }, function(err, jsonSchema) {
                    if (err) { throw err };
                    itemSchema = jsonSchema;
                    done();
                });

                req = { body: 'body', protocol: 'http', url: '/people/alice' };
                req.get = this.sinon.stub();
                req.get.withArgs('Host').returns('example.org');
                this.ljsReq = new LJSRequest(req, app);
            });

            it('should include type array', function (done) {
                var collectionSchema = new CollectionSchema(this.ljsReq, itemSchema.id);

                var callback = function(err, data){
                    expect(data.type).to.eq('array');
                    done();
                };

                collectionSchema.data(callback);
            });

            it('should include "items" key pointing to itemSchema url', function (done) {
                var collectionSchema = new CollectionSchema(this.ljsReq, itemSchema.id);

                var callback = function(err, data){
                    expect(data.items.$ref).to.eq('http://example.org/api/json-schemas/' + itemSchema.id);
                    done();
                };

                collectionSchema.data(callback);
            });

            it('should include $schema from ItemSchema', function (done) {
                var self = this;
                JsonSchema.findById(itemSchema.id, function(err, itemSchema){
                    var collectionSchema = new CollectionSchema(self.ljsReq, itemSchema.id);

                    var callback = function(err, data){
                        expect(data.$schema).to.eq(itemSchema.$schema);
                        done();
                    };

                    collectionSchema.data(callback);
                });
            });

            it('should use the property "collectionTitle" from ItemSchema as title', function (done) {
                var collectionSchema = new CollectionSchema(this.ljsReq, itemSchema.id);

                var callback = function(err, data){
                    expect(data.title).to.eq(itemSchema.collectionTitle);
                    done();
                };

                collectionSchema.data(callback);
            });
        });

        describe('when ItemSchema is not found', function() {
            it('should return empty data', function (done) {
                var collectionSchema = new CollectionSchema(this.ljsReq, 'invalid-id');

                var callback = function(err, data){
                    expect(data).to.be.empty;
                    done();
                };

                collectionSchema.data(callback);
            });
        });
    });
});