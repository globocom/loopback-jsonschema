require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var JsonSchemaLinks = require('../../../lib/models/json-schema-links');
var LJSRequest = require('../../../lib/models/ljs-request');

var app = loopback();
app.set('restApiRoot', '/api');

describe('JsonSchemaLinks', function() {
    describe('#onRequest', function() {
        var req;

        describe('without custom links', function() {
            beforeEach(function() {
                req = { body: { collectionName: 'people' }, url: '/cars/mercedes' };

                var ljsReq = new LJSRequest(req, app);
                this.sinon.stub(ljsReq, 'schemeAndAuthority').returns('http://example.org');

                var jsonSchemaLinks = new JsonSchemaLinks(ljsReq, app);
                jsonSchemaLinks.onRequest();
            });

            it('should persist empty array', function() {
                expect(req.body.links).to.be.empty;
            });
        });

        describe('with custom links', function() {
            beforeEach(function() {
                req = {
                    body: {
                        collectionName: 'people',
                        links: [
                            { rel: 'custom', href: 'http://example.org/api/people/custom' },
                            { rel: 'item', href: 'http://example.org/api/people/override/item' }
                        ]
                    },
                    url: '/cars/mercedes'
                };

                var ljsReq = new LJSRequest(req, app);
                this.sinon.stub(ljsReq, 'schemeAndAuthority').returns('http://example.org');

                var jsonSchemaLinks = new JsonSchemaLinks(ljsReq, app);
                jsonSchemaLinks.onRequest();
            });

            it('should include custom links', function() {
                expect(req.body.links[0]).to.eql({ rel: 'custom', href: 'http://example.org/api/people/custom' });
            });

            it('should not allow overriding default links', function() {
                expect(req.body.links).to.have.length(1);
                expect(req.body.links[0]).to.eql({ rel: 'custom', href: 'http://example.org/api/people/custom' });
            });
        });
    });

    describe('#onResponse', function() {
        var req, result;

        var onResponse = function(req, result) {
            var ljsReq = new LJSRequest(req, app);
            this.sinon.stub(ljsReq, 'schemeAndAuthority').returns('http://example.org');

            var jsonSchemaLinks = new JsonSchemaLinks(ljsReq, app);
            jsonSchemaLinks.onResponse(result);
        };

        describe('without result', function() {
            beforeEach(function() {
                req = { body: { }, url: '/cars/mercedes' };
                result = undefined;

                onResponse.call(this, req, result);
            });

            it('should not change anything', function() {
                expect(result).to.be.undefined;
            });
        });

        describe('without collectionName', function() {
            beforeEach(function() {
                req = { body: { }, url: '/cars/mercedes' };
                result = {};

                onResponse.call(this, req, result);
            });

            it('should not fill links', function() {
                expect(result.links).to.be.undefined;
            });
        });

        describe('without custom links', function() {
            beforeEach(function() {
                req = { body: { }, url: '/cars/mercedes' };
                result = { "links" : null, collectionName: 'people' };

                onResponse.call(this, req, result);
            });

            it('should include default links', function() {
                expect(result.links[0]).to.eql({ rel: 'self', href: 'http://example.org/api/people/{id}' });
                expect(result.links[1]).to.eql({ rel: 'item', href: 'http://example.org/api/people/{id}' });
                expect(result.links[2]).to.eql({ rel: 'update', method: 'PUT', href: 'http://example.org/api/people/{id}' });
                expect(result.links[3]).to.eql({ rel: 'delete', method: 'DELETE', href: 'http://example.org/api/people/{id}' });
            });
        });

        describe('with custom links', function() {
            beforeEach(function() {
                req = { body: { }, url: '/cars/mercedes' };
                result = {
                    links: [
                            { rel: 'custom', href: 'http://example.org/api/people/custom' },
                            { rel: 'customRelative', href: '/people/custom-relative' },
                            { rel: 'item', href: 'http://example.org/api/people/override/item' }
                        ],
                    collectionName: 'people'
                };

                onResponse.call(this, req, result);
            });

            it('should include default links', function() {
                expect(result.links[0]).to.eql({ rel: 'self', href: 'http://example.org/api/people/{id}' });
                expect(result.links[1]).to.eql({ rel: 'item', href: 'http://example.org/api/people/{id}' });
                expect(result.links[2]).to.eql({ rel: 'update', method: 'PUT', href: 'http://example.org/api/people/{id}' });
                expect(result.links[3]).to.eql({ rel: 'delete', method: 'DELETE', href: 'http://example.org/api/people/{id}' });
            });

            it('should include custom links', function() {
                expect(result.links[4]).to.eql({ rel: 'custom', href: 'http://example.org/api/people/custom' });
            });

            it('should not allow overriding default links', function() {
                expect(result.links).to.have.length(6);
                expect(result.links[1]).to.eql({ rel: 'item', href: 'http://example.org/api/people/{id}' });
            });

            it('should complete relative custom links with base url', function() {
                expect(result.links[5]).to.eql({ rel: 'customRelative', href: 'http://example.org/api/people/custom-relative' });
            });
        });
    });
});
