require('../../support');

var expect = require('chai').expect;

var locationHeaderCorrelator = require('../../../lib/http/location-header-correlator');
var LJSRequest = require('../../../lib/http/ljs-request');


describe('locationHeaderCorrelator', function() {
    var ctx, fullUrl;

    describe('when result was a default id', function(){
        before(function() {
            fullUrl = 'http://api.example.org/api/test';
            this.sinon.stub(LJSRequest.prototype, 'fullUrl').returns(fullUrl);

            ctx = {
                req: {
                    app: null
                },
                res: {
                    set: this.sinon.stub(),
                    status: this.sinon.stub()
                },
                result: {
                    id: '123',
                    constructor: {
                        getIdName: function() {
                            return 'id';
                        }
                    }
                }
            };

            locationHeaderCorrelator(ctx);
        });

        it('should correlate `Location` header', function(){
            expect(ctx.res.set).to.have.been.calledWith('Location', 'http://api.example.org/api/test/123');
        });

        it('should change response status to 201', function(){
            expect(ctx.res.status).to.have.been.calledWith(201);
        });
    });

    describe('when result was a custom id', function(){
        before(function() {
            fullUrl = 'http://api.example.org/api/test';
            this.sinon.stub(LJSRequest.prototype, 'fullUrl').returns(fullUrl);

            ctx = {
                req: {
                    app: null
                },
                res: {
                    set: this.sinon.stub(),
                    status: this.sinon.stub()
                },
                result: {
                    name: '321',
                    constructor: {
                        getIdName: function() {
                            return 'name';
                        }
                    }
                }
            };

            locationHeaderCorrelator(ctx);
        });

        it('should correlate `Location` header', function(){
            expect(ctx.res.set).to.have.been.calledWith('Location', 'http://api.example.org/api/test/321');
        });

        it('should change response status to 201', function(){
            expect(ctx.res.status).to.have.been.calledWith(201);
        });
    });
});
