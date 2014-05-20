require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var JsonSchema = require('../../../lib/models/json-schema');
var LJSRequest = require('../../../lib/models/ljs-request');

var app = loopback();
app.set('restApiRoot', '/api');

describe('JsonSchema', function() {
    describe('.defaultLinks', function() {
        it('should return default links', function() {
            var req = null;
            var ljsReq = new LJSRequest(req, app);
            this.sinon.stub(ljsReq, 'schemeAndAuthority').returns('http://example.org');
            expect(JsonSchema.defaultLinks(ljsReq, 'people')).to.eql([
                { rel: 'self', href: 'http://example.org/api/people/{id}' },
                { rel: 'item', href: 'http://example.org/api/people/{id}' },
                { rel: 'update', method: 'PUT', href: 'http://example.org/api/people/{id}' },
                { rel: 'delete', method: 'DELETE', href: 'http://example.org/api/people/{id}' }
            ]);
        });
    });

    describe('#update$schema', function() {
        it('should set $schema to hyper-schema draft-04 by default', function() {
            var jsonSchema = new JsonSchema();
            jsonSchema.update$schema();
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-04/hyper-schema#');
        });

        it('should allow overriding of $schema', function() {
            var jsonSchema = new JsonSchema({$schema: 'http://json-schema.org/draft-03/hyper-schema#'});
            jsonSchema.update$schema();
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-03/hyper-schema#');
        });
    });

    describe('#createLoopbackModel', function() {
        var Test;

        beforeEach(function() {
            var jsonSchema = new JsonSchema({modelName: 'test', collectionName: 'testplural'});
            jsonSchema.createLoopbackModel(app);
            Test = loopback.getModel('test');
        });

        it('should create model defined by this json schema', function() {
            expect(Test).to.exist;
        });

        it("should use collectionName as model's plural", function() {
            expect(Test.pluralModelName).to.equal('testplural');
        });
    });
});
