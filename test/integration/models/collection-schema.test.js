require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var loopbackJsonSchema = require('../../../index');
var JsonSchema = require('../../../lib/models/json-schema');
var CollectionSchema = require('../../../lib/models/collection-schema');

var app = loopback();
app.set('restApiRoot', '/api');
loopbackJsonSchema.initLoopbackJsonSchema(app);

describe('CollectionSchema', function() {

    describe('#data', function() {
        describe('when ItemSchema is found', function() {
            var itemSchema;

            beforeEach(function (done) {
                JsonSchema.create({ modelName: 'person', collectionName: 'people', title: 'Person', type: 'object', properties: {}  }, function(err, jsonSchema) {
                    if (err) { throw err };

                    itemSchema = jsonSchema;
                    done();
                });
            });

            it('should include type object', function (done) {
                var collectionSchema = new CollectionSchema(itemSchema.id);

                var callback = function(err, data){
                    expect(data.type).to.eq('object');
                    done();
                };

                collectionSchema.data(callback);
            });

            it('should include properties', function (done) {
                var collectionSchema = new CollectionSchema(itemSchema.id);

                var callback = function(err, data){
                    expect(data).to.include.keys('properties');
                    done();
                };

                collectionSchema.data(callback);
            });

            it('should include $schema from ItemSchema', function (done) {
                JsonSchema.findById(itemSchema.id, function(err, itemSchema){
                    var collectionSchema = new CollectionSchema(itemSchema.id);

                    var callback = function(err, data){
                        expect(data.$schema).to.eq(itemSchema.$schema);
                        done();
                    };

                    collectionSchema.data(callback);
                });
            });

            it('should use the property "collectionTitle" from ItemSchema as title', function (done) {
                var collectionSchema = new CollectionSchema(itemSchema.id);

                var callback = function(err, data){
                    expect(data.title).to.eq(itemSchema.title);
                    done();
                };

                collectionSchema.data(callback);
            });
        });

        describe('when ItemSchema is not found', function() {
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
});