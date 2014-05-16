require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var JsonSchema = require('../../../lib/models/json-schema');
var LJSRequest = require('../../../lib/models/ljs-request');

var app = loopback();
app.set('restApiRoot', '/api');

describe('JsonSchema', function() {
    describe('#addHeaders', function() {
        var req;

        beforeEach(function() {
            req = { body: {}, url: '/cars/mercedes' };
        });

        it('should add headers', function () {
            var ljsReq = new LJSRequest(req, app);
            var baseUrl = 'http://example.org/api';
            this.sinon.stub(ljsReq, 'baseUrl').returns(baseUrl);

            var res = { set: function () {}};
            this.sinon.stub(res, "set");

            var jsonSchema = new JsonSchema({ id: 123 });

            jsonSchema.addHeaders(ljsReq, res);

            expect(res.set).to.have.been.called.twice;
            expect(res.set).to.have.been.calledWith('Content-Type', "application/json; charset=utf-8; profile="+ baseUrl +"/json-schemas/123");
            expect(res.set).to.have.been.calledWith('Link', '<' + baseUrl +'/json-schemas/123>; rel=describedby');
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
