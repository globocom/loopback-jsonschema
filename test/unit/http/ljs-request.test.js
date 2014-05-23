require('../../support');

var expect = require('chai').expect;

var LJSRequest = require('../../../lib/http/ljs-request');
var LJSUrl = require('../../../lib/models/ljs-url');

describe('LJSRequest', function() {
    var ljsReq, req;

    describe('#properties', function() {
        beforeEach(function() {
            req = { body: 'body', protocol: 'http', url: '/people/1' };
            ljsReq = new LJSRequest(req);
        });

        it("should return inner request's body", function() {
            expect(ljsReq.body).to.equal(req.body);
        });
    });

    describe('#schemeAndAuthority', function() {
        beforeEach(function() {
            req = { protocol: 'http', app:{}, url: '/people/1' };
            req.get = this.sinon.stub();
            req.get.withArgs('Host').returns('example.org');
            ljsReq = new LJSRequest(req, req.app);
        });

        it("should return inner request's scheme and authority concatenated together", function() {
            expect(ljsReq.schemeAndAuthority()).to.equal('http://example.org');
        });
    });

    describe('#baseUrl', function() {
        beforeEach(function() {
            req = { protocol: 'http', app: {}, url: '/people/1' };
            req.app.get = this.sinon.stub().returns('/api');;
            req.get = this.sinon.stub();
            req.get.withArgs('Host').returns('example.org');
            ljsReq = new LJSRequest(req, req.app);
        });

        it("should return inner request's scheme, authority and api rest concatenated together", function() {
            expect(ljsReq.baseUrl()).to.equal('http://example.org/api');
        });
    });

    describe('#fullUrl', function() {
        beforeEach(function() {
            req = { protocol: 'http', app: {}, url: '/people/1', originalUrl: '/api/people/1' };
            req.get = this.sinon.stub();
            req.get.withArgs('Host').returns('example.org');
            ljsReq = new LJSRequest(req, req.app);
        });

        it("should return full url", function() {
            expect(ljsReq.fullUrl()).to.equal('http://example.org/api/people/1');
        });
    });

    describe('#ljsUrl', function() {
        beforeEach(function() {
            req = { protocol: 'http', app: {}, url: '/people/1', originalUrl: '/api/people/1' };
            req.get = this.sinon.stub();
            req.get.withArgs('Host').returns('example.org');
            ljsReq = new LJSRequest(req, req.app);
        });

        it('should build ljsUrl object from current request', function () {
            expect(ljsReq.ljsUrl()).to.be.an.instanceof(LJSUrl)
        });
    });
});
