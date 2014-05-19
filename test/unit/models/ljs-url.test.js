require('../../support');

var expect = require('chai').expect;

var LJSUrl = require('../../../lib/models/ljs-url');

describe('LJSUrl', function() {
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

    describe('.build', function() {
        it('should return an instance of LJSUrl', function() {
            expect(this.ljsUrl).to.be.an.instanceof(LJSUrl);
        });
    });

    describe('#url', function () {
        it('should return the resource schema url', function() {
            var schemaUrl = this.ljsUrl.url;

            expect(schemaUrl).to.eq('http://example.org/api/json-schemas/1');
        });
    });
});