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
            var jsonSchema = {
                id: 1,
                constructor: {
                    pluralModelName: 'json-schemas'
                }
            };

            var ljsReq = { };
            ljsReq.baseUrl = this.sinon.stub().returns('http://example.org/api');

            this.ljsUrl = LJSUrl.buildFromModel(ljsReq, jsonSchema);
        });

        it('should return an instance of LJSUrl', function() {
            expect(this.ljsUrl).to.be.an.instanceof(LJSUrl);
        });

        describe('#url', function () {
            it('should return the resource schema url', function() {
                var schemaUrl = this.ljsUrl.url;

                expect(schemaUrl).to.eq('http://example.org/api/json-schemas/1');
            });
        });
    });

    describe('.buildFromRequest', function() {
        beforeEach(function() {
            var ljsReq = { fullUrl: this.sinon.stub().returns('http://example.org/api/people') };
            this.ljsUrl = LJSUrl.buildFromRequest(ljsReq);
        });

        it("should return request's url", function () {
            expect(this.ljsUrl.url).to.eq('http://example.org/api/people');
        });
    });
});