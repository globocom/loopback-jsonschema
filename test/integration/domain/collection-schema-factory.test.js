var support = require('../../support');

var expect = require('chai').expect;

var ItemSchema = require('../../../lib/domain/item-schema');
var CollectionSchemaFactory = require('../../../lib/domain/collection-schema-factory');
var config = require('../../../lib/support/config');

var app = support.newLoopbackJsonSchemaApp();

describe('CollectionSchemaFactory', function() {

    describe('#buildFromSchemaId', function() {
        describe('invalid item-schema', function(){
            it('should return undefined', function(done){
                var callback = function(err, collectionSchema){
                    expect(collectionSchema).to.be.null;
                    done();
                };

                CollectionSchemaFactory.buildFromSchemaId('invalid-id', callback);
            });
        });

        describe('existing item schema', function() {
            var itemSchema;

            beforeEach(function(done) {
                ItemSchema.create({collectionName: 'test'}, function(err, data) {
                    if (err) { return done(err); }
                    itemSchema = data;
                    done();
                });
            });

            it('should return an instance of CollectionSchema', function (done) {
                var callback = function(err, collectionSchema){
                    expect(collectionSchema).to.be.instanceof(config.CollectionSchemaClass);
                    done();
                };

                CollectionSchemaFactory.buildFromSchemaId(itemSchema.collectionName, callback);
            });
        });
    });

});
