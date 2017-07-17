require('../../support');

var expect = require('chai').expect;

var schemaCorrelator = require('../../../lib/http/schema-correlator');
var ItemSchema = require('../../../lib/domain/item-schema');
var LJSRequest = require('../../../lib/http/ljs-request');

describe('schemaCorrelator', function() {
    var ctx,
        baseUrl = 'http://api.example.org',
        baseUrlStub,
        result,
        itemSchema = new ItemSchema({
            collectionName: 'people',
            title: 'Person',
            collectionTitle: 'People',
            type: 'object',
            properties: {}
        });

    describe('.collection', function() {
        before(function() {
            ctx = {
                req: {
                    app: null,
                    protocol: 'http',
                    get: (name) => {
                        if (name === 'Host') {
                            return 'example.org';
                        }
                    },
                },
                res: {
                    set: this.sinon.stub()
                }
            };

            result = {
                constructor: {
                    pluralModelName: 'people'
                }
            };
        });

        describe('without queryparams', function(done){
            beforeEach(function(done) {
                baseUrlStub = this.sinon.stub(LJSRequest.prototype, 'baseUrl').returns(baseUrl);
                schemaCorrelator.collection('people', ctx, result, function() {
                    done();
                });
            });

            after(function() {
                baseUrlStub.restore();
            });

            it('should correlate `Content-Type` header', function(){
                var schemaUrl = baseUrl + '/collection-schemas/people';
                expect(ctx.res.set).to.have.been.calledWith('Content-Type', 'application/json; charset=utf-8; profile="' + schemaUrl + '"');
            });

            it('should correlate `Link` header', function(){
                var schemaUrl = baseUrl + '/collection-schemas/people';
                expect(ctx.res.set).to.have.been.calledWith('Link', '<' + schemaUrl + '>; rel="describedby"');
            });
        });

        describe('with queryparams', function(done){
            beforeEach(function(done) {
                baseUrlStub = this.sinon.stub(LJSRequest.prototype, 'baseUrl').returns(baseUrl);
                schemaCorrelator.collection('people', {_debug: 'true'}, ctx, result, function() {
                    done();
                });
            });

            afterEach(function() {
                baseUrlStub.restore();
            });

            it('should correlate `Content-Type` header', function(){
                var schemaUrl = baseUrl + '/collection-schemas/people?_debug=true';
                expect(ctx.res.set).to.have.been.calledWith('Content-Type', 'application/json; charset=utf-8; profile="' + schemaUrl + '"');
            });

            it('should correlate `Link` header', function(){
                var schemaUrl = baseUrl + '/collection-schemas/people?_debug=true';
                expect(ctx.res.set).to.have.been.calledWith('Link', '<' + schemaUrl + '>; rel="describedby"');
            });
        });
    });

    describe('.instance', function() {
        before(function() {
            ctx = {
                req: {
                    app: null,
                    protocol: 'http',
                    get: (name) => {
                        if (name === 'Host') {
                            return 'example.org';
                        }
                    },
                },
                res: {
                    set: this.sinon.stub()
                }
            };

            result = {
                constructor: {
                    pluralModelName: 'people'
                }
            };
        });

        describe('with querystring', function(){
            before(function(done) {
                baseUrlStub = this.sinon.stub(LJSRequest.prototype, 'baseUrl').returns(baseUrl);

                schemaCorrelator.instance('people', {compact: 'false'}, ctx, result, function() {
                    done();
                });
            });

            after(function() {
                baseUrlStub.restore();
            });

            it('should correlate `Content-Type` header', function(){
                var schemaUrl = baseUrl + '/item-schemas/people?compact=false';
                expect(ctx.res.set).to.have.been.calledWith('Content-Type', 'application/json; charset=utf-8; profile="' + schemaUrl + '"');
            });

            it('should correlate `Link` header', function(){
                var schemaUrl = baseUrl + '/item-schemas/people?compact=false';
                expect(ctx.res.set).to.have.been.calledWith('Link', '<' + schemaUrl + '>; rel="describedby"');
            });
        });
    });
});
