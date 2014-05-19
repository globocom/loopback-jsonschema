require('../../support');

var expect = require('chai').expect;

var LJSUrl = require('../../../lib/models/ljs-url');

describe('LJSUrl', function() {
    describe('#isCollection', function () {
        describe('when url represents a collection', function () {
            beforeEach(function() {
                this.ljsUrl = new LJSUrl('http://example.org/api/people');
            });

            it('should return true', function () {
                expect(this.ljsUrl.isCollection()).to.be.true;
            });
        });

        describe('when url represents an item', function () {
            beforeEach(function() {
                this.ljsUrl = new LJSUrl('http://example.org/api/people/1');
            });

            it('should return false', function () {
                expect(this.ljsUrl.isCollection()).to.be.false;
            });
        });
    });

    describe('.buildFromModel', function() {
        beforeEach(function() {
            var person = {
                id: 1,
                constructor: {
                    pluralModelName: 'people'
                }
            };

            var ljsReq = {};
            ljsReq.baseUrl = this.sinon.stub().returns('http://example.org/api');
            this.ljsUrl = LJSUrl.buildFromModel(ljsReq, person);
        });

        it('should build url from given model', function() {
            expect(this.ljsUrl.url).to.eq('http://example.org/api/people/1');
        });
    });

    describe('.buildFromCollectionName', function() {
        beforeEach(function() {
            var ljsReq = {};
            ljsReq.baseUrl = this.sinon.stub().returns('http://example.org/api');
            this.ljsUrl = LJSUrl.buildFromCollectionName(ljsReq, 'people');
        });

        it('should build url from given collection name', function() {
            expect(this.ljsUrl.url).to.eq('http://example.org/api/people');
        });
    });

    describe('.buildFromRequest', function() {
        beforeEach(function() {
            var ljsReq = { fullUrl: this.sinon.stub().returns('http://example.org/api/people') };
            this.ljsUrl = LJSUrl.buildFromRequest(ljsReq);
        });

        it('should build url from given request', function () {
            expect(this.ljsUrl.url).to.eq('http://example.org/api/people');
        });
    });
});