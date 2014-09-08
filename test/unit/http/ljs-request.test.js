require('../../support');

var expect = require('chai').expect;

var LJSRequest = require('../../../lib/http/ljs-request');
var LJSUrl = require('../../../lib/http/ljs-url');

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

    describe('#safeHeaders', function() {
        describe('when authorization header is present', function () {
            beforeEach(function() {
                req.headers = {'authorization': 'Bearer'};
                ljsReq = new LJSRequest(req, req.app);
            });

            it('should replace Authorization header value', function() {
                expect(ljsReq.safeHeaders()['authorization']).to.eq('CONFIDENTIAL');
            });
        });

        describe('when authorization header is not present', function () {
            beforeEach(function() {
                req.headers = {};
                ljsReq = new LJSRequest(req, req.app);
            });

            it('should not include Authorization header', function() {
                expect(ljsReq.safeHeaders()).to.not.contain.key('authorization');
            });
        });
    });

    describe('#isContentTypeSupported', function() {
        beforeEach(function() {
            req = {
                headers: {},
                method: ''
            };
        });

        describe('when request is a GET', function() {
            beforeEach(function() {
                req.method = 'GET';
                ljsReq = new LJSRequest(req, req.app);
            });

            it('should be true', function() {
                expect(ljsReq.isContentTypeSupported()).to.be.true;
            });
        });

        describe('when request has content length > 0', function() {
            beforeEach(function() {
                req.headers['content-length'] = 1;
            });

            describe('and Content-Type is application/json', function() {
                beforeEach(function() {
                    req.headers['content-type'] = 'application/json';
                    ljsReq = new LJSRequest(req, req.app);
                });

                it('should be truthy', function() {
                    expect(ljsReq.isContentTypeSupported()).to.be.truthy;
                });
            });

            describe('and Content-Type is application/schema+json', function() {
                beforeEach(function() {
                    req.headers['content-type'] = 'application/schema+json';
                    ljsReq = new LJSRequest(req, req.app);
                });

                it('should be truthy', function() {
                    expect(ljsReq.isContentTypeSupported()).to.be.truthy;
                });
            });

            describe('and Content-Type is vendor specific json', function() {
                beforeEach(function() {
                    req.headers['content-type'] = 'application/vnd.acme+json';
                    ljsReq = new LJSRequest(req, req.app);
                });

                it('should be truthy', function() {
                    expect(ljsReq.isContentTypeSupported()).to.be.truthy;
                });
            });

            describe('and Content-Type is not json', function() {
                beforeEach(function() {
                    req.headers['content-type'] = 'text/plain';
                    ljsReq = new LJSRequest(req, req.app);
                });

                it('should return false', function() {
                    expect(ljsReq.isContentTypeSupported()).to.be.false;
                });
            });

            describe('and Content-Type is vendor specific but not json', function() {
                beforeEach(function() {
                    req.headers['content-type'] = 'application/vnd.acme';
                    ljsReq = new LJSRequest(req, req.app);
                });

                it('should return false', function() {
                    expect(ljsReq.isContentTypeSupported()).to.be.false;
                });
            });

            describe('and Content-Type is undefined', function() {
                beforeEach(function() {
                    delete req.headers['content-type'];
                    ljsReq = new LJSRequest(req, req.app);
                });

                it('should return false', function() {
                    expect(ljsReq.isContentTypeSupported()).to.be.false;
                });
            });
        });
    });
});
