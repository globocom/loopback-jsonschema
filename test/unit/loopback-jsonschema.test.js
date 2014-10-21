require('../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var CollectionSchema = require('../../lib/domain/collection-schema');
var ItemSchema = require('../../lib/domain/item-schema');

var config = require('../../lib/support/config');
var loopbackJsonSchema = require('../../index');


describe('loopbackJsonSchema', function() {
    describe('.init', function() {
        var app;

        before(function() {
            app = loopback();
        });

        it('should allow overriding default config', function() {
            var myConfig = {
                CollectionSchemaClass: 'MyCollectionSchemaClass',
                jsonSchemaValidatorTranslation: {
                    draft4: {}
                },
                Model: 'MyModel',
                myConfigOption: 'myValue'
            };
            loopbackJsonSchema.init(app, myConfig);
            expect(config).to.eql({
                CollectionSchemaClass: 'MyCollectionSchemaClass',
                jsonSchemaValidatorTranslation: {
                    draft4: {}
                },
                logLevel: 'info',
                Model: 'MyModel',
                myConfigOption: 'myValue',
                registerItemSchemaAtRequest: true
            });
        });

        it('should set strong-remoting params', function(){
            loopbackJsonSchema.init(app, { CollectionSchemaClass: CollectionSchema });
            expect(app.get('remoting')).to.eql({
                json: {
                    type: [
                        'json',
                        '+json'
                    ]
                }});
        });


        describe('when registerItemSchemaAtRequest is false', function(){
            var app, findStub, itemSchemas;

            before(function(done) {
                app = loopback();

                itemSchemas = ['people', 'pencils'].map(function(collectionName) {
                    return {
                        collectionName: collectionName,
                        registerLoopbackModel: function(app, callback) {
                            setTimeout(function() {
                                callback(null);
                            }, 100);
                        }
                    };
                });

                findStub = this.sinon.stub(ItemSchema, 'find').yields(null, itemSchemas);
                loopbackJsonSchema.init(app, { registerItemSchemaAtRequest: false });

                app.once('loadSchemas', function() {
                    done();
                });
            });

            it('ItemSchema.find to have been called with {}', function(){
                expect(findStub).to.have.been.calledWith({});
            });
        });
    });
});
