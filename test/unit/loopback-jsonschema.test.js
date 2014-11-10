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
                generatedId: true,
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

                findStub = this.sinon.stub(ItemSchema, 'find').yields(null, []);
                loopbackJsonSchema.init(app, { registerItemSchemaAtRequest: false });

                app.once('loadModels', function() {
                    done();
                });
            });

            it('ItemSchema.find to have been called with {}', function(){
                expect(findStub).to.have.been.calledWith({});
            });
        });
    });
});
