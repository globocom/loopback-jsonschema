require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var ItemSchema = require('../../../lib/domain/item-schema');
var CollectionSchemaFactory = require('../../../lib/domain/collection-schema-factory');
var config = require('../../../lib/support/config');

var app = loopback();
app.set('restApiRoot', '/api');

describe('CollectionSchemaFactory', function() {

    describe('#buildFromSchemaId', function() {
        describe('invalid item-schema', function(){
            it('should return undefined', function(done){
                var callback = function(err, collectionSchema){
                    expect(collectionSchema).to.be.undefined;
                    done();
                };

                CollectionSchemaFactory.buildFromSchemaId('invalid-id', callback);
            });
        });

        describe('existing item schema', function(){
            var itemSchema;

            beforeEach(function(done) {
                ItemSchema.create({modelName: 'test'}, function(err, data) {
                    if (err) { throw err };

                    itemSchema = data;
                    done();
                });
            });

            it('should return an instance of CollectionSchema', function (done) {
                var callback = function(err, collectionSchema){
                    expect(collectionSchema).to.be.instanceof(config.CollectionSchemaClass);
                    done();
                };

                CollectionSchemaFactory.buildFromSchemaId(itemSchema.id, callback);
            });
        });
    });

});
