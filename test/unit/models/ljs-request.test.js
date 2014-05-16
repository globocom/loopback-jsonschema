require('../../support');

var expect = require('chai').expect;

var LJSRequest = require('../../../lib/models/ljs-request');

describe('LJSRequest', function() {
    var ljsReq, req;

    describe('#properties', function() {
        beforeEach(function() {
            req = { body: 'body', protocol: 'http', url: '/cars/mercedes' };
            ljsReq = new LJSRequest(req);
        });

        it("should return inner request's body", function() {
            expect(ljsReq.body).to.equal(req.body);
        });

        it("should return 'cars' as collectionName", function() {
            expect(ljsReq.collectionName).to.equal('cars');
        });
    });

    describe('#schemeAndAuthority', function() {
        beforeEach(function() {
            req = { protocol: 'http', app:{}, url: '/cars/mercedes' };
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
            req = { protocol: 'http', app: {}, url: '/cars/mercedes' };
            req.app.get = this.sinon.stub().returns('/api');;
            req.get = this.sinon.stub();
            req.get.withArgs('Host').returns('example.org');
            ljsReq = new LJSRequest(req, req.app);
        });

        it("should return inner request's scheme, authority and api rest concatenated together", function() {
            expect(ljsReq.baseUrl()).to.equal('http://example.org/api');
        });
    });
});
