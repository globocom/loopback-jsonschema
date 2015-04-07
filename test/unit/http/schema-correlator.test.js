require('../../support');

var expect = require('chai').expect;

var schemaCorrelator = require('../../../lib/http/schema-correlator');
var ItemSchema = require('../../../lib/domain/item-schema');
var LJSRequest = require('../../../lib/http/ljs-request');

describe ('schemaCorrelator', function() {
    var ctx;
    var baseUrl = 'http://api.example.org';
    var result;
    var itemSchema = new ItemSchema({
        modelName: 'person',
        collectionName: 'people',
        title: 'Person',
        collectionTitle: 'People',
        type: 'object',
        properties: {}
    });

    describe('.collection', function() {
        before(function(done) {
            this.sinon.stub(LJSRequest.prototype, 'baseUrl').returns(baseUrl);

            ctx = {
                req: {
                    app: null
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

            schemaCorrelator.collection('people', ctx, result, function() {
                done();
            });
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

    describe('.instance', function() {
        before(function(done) {
            this.sinon.stub(LJSRequest.prototype, 'baseUrl').returns(baseUrl);

            ctx = {
                req: {
                    app: null
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

            schemaCorrelator.instance('people', ctx, result, function() {
                done();
            });
        });


        it('should correlate `Content-Type` header', function(){
            var schemaUrl = baseUrl + '/item-schemas/people';
            expect(ctx.res.set).to.have.been.calledWith('Content-Type', 'application/json; charset=utf-8; profile="' + schemaUrl + '"');
        });

        it('should correlate `Link` header', function(){
            var schemaUrl = baseUrl + '/item-schemas/people';
            expect(ctx.res.set).to.have.been.calledWith('Link', '<' + schemaUrl + '>; rel="describedby"');
        });
    });
});
