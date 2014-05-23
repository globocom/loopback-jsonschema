require('../../support');

var expect = require('chai').expect;

var linksRewriter = require('../../../lib/http/links-rewriter');

describe('linksRewriter', function() {
    describe('.makeAbsolute', function() {
        var links, ljsReq;

        before(function() {
            ljsReq = {};
            ljsReq.baseUrl = this.sinon.stub().returns('http://example.org');
        });

        describe('when href is relative', function() {
            beforeEach(function() {
                links = [
                    { href: '/relative' }
                ];
                linksRewriter.makeAbsolute(ljsReq, links);
            });

            it('should make href absolute', function() {
                expect(links[0].href).to.eq('http://example.org/relative');
            });
        });

        describe('when href is absolute', function() {
            beforeEach(function() {
                links = [
                    { href: 'http://example.org/absolute' }
                ];
                linksRewriter.makeAbsolute(ljsReq, links);
            });

            it('should do nothing', function() {
                expect(links[0].href).to.eq('http://example.org/absolute');
            });
        });

        describe('when schema.$ref is relative', function() {
            beforeEach(function() {
                links = [
                    { schema: { $ref: '/relative' } }
                ];
                linksRewriter.makeAbsolute(ljsReq, links);
            });

            it('should make schema.$ref absolute', function() {
                expect(links[0].schema.$ref).to.eq('http://example.org/relative');
            });
        });

        describe('when schema.$ref is absolute', function() {
            beforeEach(function() {
                links = [
                    { schema: { $ref: 'http://example.org/absolute' } }
                ];
                linksRewriter.makeAbsolute(ljsReq, links);
            });

            it('should do nothing', function() {
                expect(links[0].schema.$ref).to.eq('http://example.org/absolute');
            });
        });

        describe('when links does not exist', function() {
            beforeEach(function() {
                links = undefined;
                linksRewriter.makeAbsolute(ljsReq, links);
            });

            it('should do nothing', function() {
                expect(links).to.be.undefined;
            });
        });

        describe('when no keys with url exist', function() {
            beforeEach(function() {
                links = [{}];
                linksRewriter.makeAbsolute(ljsReq, links);
            });

            it('should do nothing', function() {
                expect(links[0]).to.eql({});
            });
        });

        describe('when schema exists but with no keys with url', function() {
            beforeEach(function() {
                links = [
                    { schema: {} }
                ];
                linksRewriter.makeAbsolute(ljsReq, links);
            });

            it('should do nothing', function() {
                expect(links[0]).to.eql({ schema: {} });
            });
        });
    });
});
