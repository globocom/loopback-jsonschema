require('../../support');

var expect = require('chai').expect;

var LJSRequest = require('../../../models/ljs-request');

describe('LJSRequest', function() {
    var ljsReq, req;

    describe('#body', function() {
        beforeEach(function() {
            req = { body: 'body' };
            ljsReq = new LJSRequest(req);
        });

        it("should return inner request's body", function() {
            expect(ljsReq.body).to.equal(req.body);
        });
    });

    describe('#schemeAndAuthority', function() {
        beforeEach(function() {
            req = { protocol: 'http' };
            req.get = this.sinon.stub();
            req.get.withArgs('Host').returns('example.org');
            ljsReq = new LJSRequest(req);
        });

        it("should return inner request's scheme and authority concatenated together", function() {
            expect(ljsReq.schemeAndAuthority()).to.equal('http://example.org');
        });
    });
});
