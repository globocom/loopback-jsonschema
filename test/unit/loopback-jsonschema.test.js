require('../support');

var expect = require('chai').expect;
var loopback = require('loopback');
var _ = require('underscore');

var CollectionSchema = require('../../lib/domain/collection-schema');
var ItemSchema = require('../../lib/domain/item-schema');
var schemaCorrelatorHooks = require('../../lib/http/schema-correlator-hooks');

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
                registerItemSchemaAtRequest: true,
                registerItemSchemaAttemptDelay: 200,
                registerItemSchemaMaxAttempts: 5,
                collectionRemoteName: 'find',
                instanceRemoteNames: [
                    'findById', 'upsert', 'create',
                    'prototype.updateAttributes', 'prototype.delete',
                    'deleteById'
                ]
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


        it('should register schema correlator hook', function(){
            loopbackJsonSchema.init(app);
            var hooksFound = _.filter(ItemSchema.modelHooksInitializers, function(hook){
                return hook === schemaCorrelatorHooks;
            });

            expect(hooksFound.length).to.be.eql(1);
        });


        it('should redefine `ItemSchema.modelHooksInitializers` before attach the ItemSchema', function(done){
            var wrongHook = function() {};
            ItemSchema.modelHooksInitializers = [wrongHook];

            ItemSchema.once('attached', function() {
                expect(ItemSchema.modelHooksInitializers).to.not.be.include(wrongHook);
                done();
            });

            loopbackJsonSchema.init(app);
        });

        it('should populate `ItemSchema.modelHooksInitializers` with two default hooks', function(done){

            ItemSchema.once('attached', function() {
                expect(ItemSchema.modelHooksInitializers.length).to.be.eql(2);
                done();
            });

            loopbackJsonSchema.init(app);
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
