require('../../support');

var expect = require('chai').expect;

var schemaCorrelator = require('../../../lib/http/schema-correlator');
var ItemSchema = require('../../../lib/domain/item-schema');
var LJSRequest = require('../../../lib/http/ljs-request');

describe ('schemaCorrelator', function() {
    var ctx;
    var baseUrl = 'http://api.example.org';
    var itemSchema = new ItemSchema({
        id: '123',
        modelName: 'person',
        collectionName: 'people',
        title: 'Person',
        collectionTitle: 'People',
        type: 'object',
        properties: {}
    });

    describe('.correlateCollection', function() {
        describe('when `ItemSchema.findByCollectionName` returns a error', function(){
            var expectedError;

            before(function(done) {
                var error = new Error('Error example');
                this.sinon.stub(ItemSchema, 'findByCollectionName').withArgs('people').yields(error);
                this.sinon.stub(LJSRequest.prototype, 'baseUrl').returns(baseUrl);

                ctx = {
                    req: {
                        app: null
                    },
                    res: {
                        set: this.sinon.stub()
                    }
                };

                schemaCorrelator.correlateCollection('people', ctx, function(err) {
                    expectedError = err;
                    done();
                });
            });

            it('should return an error', function(){
                expect(expectedError.message).to.be.eql('Error example');
            });
        });

        describe('when schema was found', function(){
            before(function(done) {
                this.sinon.stub(ItemSchema, 'findByCollectionName').withArgs('people').yields(null, itemSchema);
                this.sinon.stub(LJSRequest.prototype, 'baseUrl').returns(baseUrl);

                ctx = {
                    req: {
                        app: null
                    },
                    res: {
                        set: this.sinon.stub()
                    }
                };

                schemaCorrelator.correlateCollection('people', ctx, function() {
                    done();
                });
            });


            it('should correlate `Content-Type` header', function(){
                var schemaUrl = baseUrl + '/collection-schemas/123';
                expect(ctx.res.set).to.have.been.calledWith('Content-Type', 'application/json; charset=utf-8; profile="' + schemaUrl + '"');
            });

            it('should correlate `Link` header', function(){
                var schemaUrl = baseUrl + '/collection-schemas/123';
                expect(ctx.res.set).to.have.been.calledWith('Link', '<' + schemaUrl + '>; rel="describedby"');
            });
        });

        describe('when schema was not found', function(){
            before(function(done) {
                this.sinon.stub(LJSRequest.prototype, 'baseUrl').returns(baseUrl);
                this.sinon.stub(ItemSchema, 'findByCollectionName').withArgs('people').yields(null, null);

                ctx = {
                    req: {
                        app: null
                    },
                    res: {
                        set: this.sinon.stub()
                    }
                };

                schemaCorrelator.correlateCollection('people', ctx, function() {
                    done();
                });
            });

            it('should not set headers', function(){
                expect(ctx.res.set).to.not.have.been.called;
            });
        });
    });

    describe('.correlateInstance', function() {
        describe('when `ItemSchema.findByCollectionName` returns a error', function(){
            var expectedError;

            before(function(done) {
                var error = new Error('Error example');
                this.sinon.stub(ItemSchema, 'findByCollectionName').withArgs('people').yields(error);
                this.sinon.stub(LJSRequest.prototype, 'baseUrl').returns(baseUrl);

                ctx = {
                    req: {
                        app: null
                    },
                    res: {
                        set: this.sinon.stub()
                    }
                };

                schemaCorrelator.correlateInstance('people', ctx, function(err) {
                    expectedError = err;
                    done();
                });
            });

            it('should return an error', function(){
                expect(expectedError.message).to.be.eql('Error example');
            });
        });

        describe('when schema was found', function(){
            before(function(done) {
                this.sinon.stub(ItemSchema, 'findByCollectionName').withArgs('people').yields(null, itemSchema);
                this.sinon.stub(LJSRequest.prototype, 'baseUrl').returns(baseUrl);

                ctx = {
                    req: {
                        app: null
                    },
                    res: {
                        set: this.sinon.stub()
                    }
                };

                schemaCorrelator.correlateInstance('people', ctx, function() {
                    done();
                });
            });


            it('should correlate `Content-Type` header', function(){
                var schemaUrl = baseUrl + '/item-schemas/123';
                expect(ctx.res.set).to.have.been.calledWith('Content-Type', 'application/json; charset=utf-8; profile="' + schemaUrl + '"');
            });

            it('should correlate `Link` header', function(){
                var schemaUrl = baseUrl + '/item-schemas/123';
                expect(ctx.res.set).to.have.been.calledWith('Link', '<' + schemaUrl + '>; rel="describedby"');
            });
        });

        describe('when schema was not found', function(){
            before(function(done) {
                this.sinon.stub(LJSRequest.prototype, 'baseUrl').returns(baseUrl);
                this.sinon.stub(ItemSchema, 'findByCollectionName').withArgs('people').yields(null, null);

                ctx = {
                    req: {
                        app: null
                    },
                    res: {
                        set: this.sinon.stub()
                    }
                };

                schemaCorrelator.correlateInstance('people', ctx, function() {
                    done();
                });
            });

            it('should not set headers', function(){
                expect(ctx.res.set).to.not.have.been.called;
            });
        });
    });
});
