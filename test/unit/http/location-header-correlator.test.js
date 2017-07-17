require('../../support');

var expect = require('chai').expect;

var locationHeaderCorrelator = require('../../../lib/http/location-header-correlator');
var LJSRequest = require('../../../lib/http/ljs-request');


describe('locationHeaderCorrelator', function() {
    var fullUrl = 'http://api.example.org/api/test';
    var ctx, fullUrlStub, result, nextSpy;

    describe('when result was a default id', function(){
        describe('when url not end switch /', function(){
            beforeEach(function() {
                fullUrlStub = this.sinon.stub(LJSRequest.prototype, 'fullUrl').returns(fullUrl);

                result = {
                    id: '123',
                    constructor: {
                        getIdName: function() {
                            return 'id';
                        }
                    }
                };
                ctx = {
                    req: {
                        app: null
                    },
                    res: {
                        set: this.sinon.stub(),
                        status: this.sinon.stub()
                    }
                };

                nextSpy = this.sinon.spy();

                locationHeaderCorrelator(ctx, result, nextSpy);
            });

            afterEach(function() {
                fullUrlStub.restore();
            });

            it('should call `next` parameter', function(){
                expect(nextSpy).to.be.called;
            });

            it('should correlate `Location` header', function(){
                expect(ctx.res.set).to.have.been.calledWith('Location', 'http://api.example.org/api/test/123');
            });

            it('should change response status to 201', function(){
                expect(ctx.res.status).to.have.been.calledWith(201);
            });
        });

        describe('when url end switch /', function(){
            before(function() {
                fullUrlStub = this.sinon.stub(LJSRequest.prototype, 'fullUrl').returns(fullUrl);
                ctx = {
                    req: {
                        app: null
                    },
                    res: {
                        set: this.sinon.stub(),
                        status: this.sinon.stub()
                    }
                };

                result = {
                    id: '123',
                    constructor: {
                        getIdName: function() {
                            return 'id';
                        }
                    }
                };

                nextSpy = this.sinon.spy();

                locationHeaderCorrelator(ctx, result, nextSpy);
            });

            after(function() {
                fullUrlStub.restore();
            });

            it('should correlate `Location` header', function(){
                expect(ctx.res.set).to.have.been.calledWith('Location', 'http://api.example.org/api/test/123');
            });

            it('should change response status to 201', function(){
                expect(ctx.res.status).to.have.been.calledWith(201);
            });
        });
    });

    describe('when result was a custom id', function(){
        before(function() {
            fullUrlStub = this.sinon.stub(LJSRequest.prototype, 'fullUrl').returns(fullUrl);

            ctx = {
                req: {
                    app: null
                },
                res: {
                    set: this.sinon.stub(),
                    status: this.sinon.stub()
                }
            };

            result = {
                name: '321',
                constructor: {
                    getIdName: function() {
                        return 'name';
                    }
                }
            };

            nextSpy = this.sinon.spy();

            locationHeaderCorrelator(ctx, result, nextSpy);
        });

        after(function() {
            fullUrlStub.restore();
        });

        it('should correlate `Location` header', function(){
            expect(ctx.res.set).to.have.been.calledWith('Location', 'http://api.example.org/api/test/321');
        });

        it('should change response status to 201', function(){
            expect(ctx.res.status).to.have.been.calledWith(201);
        });
    });
});
