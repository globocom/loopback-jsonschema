require('../support');

var expect = require('chai').expect;
var loopback = require('loopback');
var _ = require('lodash');

var CollectionSchema = require('../../lib/domain/collection-schema');
var ItemSchema = require('../../lib/domain/item-schema');
var schemaCorrelatorHooks = require('../../lib/http/schema-correlator-hooks');

var loopbackJsonSchema = require('../../index');
var config = require('../../lib/support/config');
var configPath = require.resolve('../../lib/support/config');


describe('loopbackJsonSchema', function() {
    describe('.init', function() {
        var app;

        before(function() {
            app = loopback();
        });

        it('should allow overriding default config', function() {
            var myConfig = {
                Model: 'MyModel',
                myConfigOption: 'myValue'
            };
            loopbackJsonSchema.init(app, myConfig);
            expect(config.Model).to.eql('MyModel');
            expect(config.myConfigOption).to.eql('myValue');
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
            var hooksFound = _.filter(ItemSchema.remoteHookInitializers, function(hook){
                return hook === schemaCorrelatorHooks;
            });

            expect(hooksFound.length).to.be.eql(1);
        });


        it('should redefine `ItemSchema.remoteHookInitializers` before attach the ItemSchema', function(done){
            var wrongHook = function() {};
            ItemSchema.remoteHookInitializers = [wrongHook];

            ItemSchema.once('attached', function() {
                expect(ItemSchema.remoteHookInitializers).to.not.include(wrongHook);
                done();
            });

            loopbackJsonSchema.init(app);
        });

        it('should populate `ItemSchema.remoteHookInitializers` with two default hooks', function(done){

            ItemSchema.once('attached', function() {
                expect(ItemSchema.remoteHookInitializers.length).to.be.eql(3);
                done();
            });

            loopbackJsonSchema.init(app);
        });


        describe('when registerItemSchemaAtRequest is false', function() {
            var app, findStub;

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
