require('../../support');

var expect = require('chai').expect;

var schemaBodyUrlRewriter = require('../../../lib/http/schema-body-url-rewriter');

describe('schemaBodyUrlRewriter', function() {
    describe('.makeAbsolute', function() {
        var body = {}
        var ljsReq;

        before(function() {
            ljsReq = {};
            ljsReq.baseUrl = this.sinon.stub().returns('http://example.org');
        });

        describe('when links href is relative', function() {
            beforeEach(function() {
                body.links = [
                    { href: '/relative' }
                ];
                schemaBodyUrlRewriter.makeAbsolute(ljsReq, body);
            });

            it('should make href absolute', function() {
                expect(body.links[0].href).to.eq('http://example.org/relative');
            });
        });

        describe('when links href is absolute', function() {
            beforeEach(function() {
                body.links = [
                    { href: 'http://example.org/absolute' }
                ];
                schemaBodyUrlRewriter.makeAbsolute(ljsReq, body);
            });

            it('should do nothing', function() {
                expect(body.links[0].href).to.eq('http://example.org/absolute');
            });
        });

        describe('when links $ref is relative', function() {
            beforeEach(function() {
                body.links = [
                    { schema: { $ref: '/relative' } }
                ];
                schemaBodyUrlRewriter.makeAbsolute(ljsReq, body);
            });

            it('should make schema.$ref absolute', function() {
                expect(body.links[0].schema.$ref).to.eq('http://example.org/relative');
            });
        });

        describe('when links $ref is absolute', function() {
            beforeEach(function() {
                body.links = [
                    { schema: { $ref: 'http://example.org/absolute' } }
                ];
                schemaBodyUrlRewriter.makeAbsolute(ljsReq, body);
            });

            it('should do nothing', function() {
                expect(body.links[0].schema.$ref).to.eq('http://example.org/absolute');
            });
        });

        describe('when properties $ref is relative', function() {
            beforeEach(function() {
                body.properties = {
                    items: { $ref: '/relative' }
                };
                schemaBodyUrlRewriter.makeAbsolute(ljsReq, body);
            });

            it('should make schema.$ref absolute', function() {
                expect(body.properties.items.$ref).to.eq('http://example.org/relative');
            });
        });

        describe('when properties $ref is absolute', function() {
            beforeEach(function() {
                body.properties = {
                    items: { $ref: 'http://example.org/absolute' }
                };
                schemaBodyUrlRewriter.makeAbsolute(ljsReq, body);
            });

            it('should do nothing', function() {
                expect(body.properties.items.$ref).to.eq('http://example.org/absolute');
            });
        });

        describe('when links and properties do not exist', function() {
            beforeEach(function() {
                body.links = undefined;
                body.properties = undefined;
                schemaBodyUrlRewriter.makeAbsolute(ljsReq, body);
            });

            it('should do nothing', function() {
                expect(body.links).to.be.undefined;
                expect(body.properties).to.be.undefined;
            });
        });

        describe('when no keys with url exist', function() {
            beforeEach(function() {
                body.links = [{}];
                body.properties = {};
                schemaBodyUrlRewriter.makeAbsolute(ljsReq, body);
            });

            it('should do nothing', function() {
                expect(body.links[0]).to.eql({});
                expect(body.properties).to.eql({});
            });
        });

        describe('when href is a child of something other than links', function() {
            beforeEach(function() {
                body.properties = {
                    href: '/relative'
                };
                schemaBodyUrlRewriter.makeAbsolute(ljsReq, body);
            });

            it('should do nothing', function() {
                expect(body.properties.href).to.eq('/relative');
            });
        });

        describe('when $ref is a child of something other than links or properties', function() {
            beforeEach(function() {
                body.something = {
                    href: '/relative'
                };
                schemaBodyUrlRewriter.makeAbsolute(ljsReq, body);
            });

            it('should do nothing', function() {
                expect(body.something.href).to.eq('/relative');
            });
        });
    });
});
