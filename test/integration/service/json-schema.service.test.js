require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var loopbackJsonSchema = require('../../../index');
var LJSRequest = require('../../../lib/models/ljs-request');
var JsonSchema = require('../../../lib/models/json-schema');
var JsonSchemaService = require('../../../lib/service/json-schema.service');

var app = loopback();
app.set('restApiRoot', '/api');

describe('json-schema.service', function() {
    var jsonSchemaService, ljsReq;

    beforeEach(function() {
        var req = { body: 'body', protocol: 'http', url: '/people', app: app };
        req.get = this.sinon.stub();
        req.get.withArgs('Host').returns('example.org');

        ljsReq = new LJSRequest(req);
        var res = { set: function () {} };
        this.sinon.stub(res, "set");

        jsonSchemaService = new JsonSchemaService(ljsReq, res);
    });

    describe('#build', function() {
        beforeEach(function() {
            this.sinon.stub(console, 'info');
            this.sinon.stub(console, 'warn');
        });

        it('should register loopback model for an existing collection JSON schema', function(done) {
            var jsonSchema = JsonSchema.create({ modelName: 'person', collectionName: 'people' });

            var next = function() {
                var Person = loopback.getModel('person');
                expect(Person).to.not.be.null;
                expect(Person.definition.name).to.equal('person');
                expect(Person.definition.settings.plural).to.equal('people');
                done();
            };
            jsonSchemaService.build(next);

            JsonSchema.remove({ modelName: 'person' });
        });

        it('should log when collection JSON schema was not found', function(done) {
            var next = function() {
                expect(console.warn).to.have.been.calledWith('JSON Schema for collectionName', 'people', 'not found.');
                done();
            };

            jsonSchemaService.build(next);
        });
    });
});