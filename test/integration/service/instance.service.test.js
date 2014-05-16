require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var loopbackJsonSchema = require('../../../index');
var logger = require('../../../lib/support/logger')
var LJSRequest = require('../../../lib/models/ljs-request');
var JsonSchema = require('../../../lib/models/json-schema');
var InstanceService = require('../../../lib/service/instance.service');

var app = loopback();
app.set('restApiRoot', '/api');

describe('instance.service', function() {
    var instanceService, ljsReq;

    beforeEach(function() {
        var req = { body: 'body', protocol: 'http', url: '/people', app: app };
        req.get = this.sinon.stub();
        req.get.withArgs('Host').returns('example.org');

        ljsReq = new LJSRequest(req, app);
        var res = { set: function () {} };
        this.sinon.stub(res, "set");

        instanceService = new InstanceService(ljsReq, res);
    });

    describe('#build', function() {
        beforeEach(function() {
            this.sinon.stub(logger, 'info');
            this.sinon.stub(logger, 'warn');
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
            instanceService.build(next);

            JsonSchema.remove({ modelName: 'person' });
        });

        it('should log when collection JSON schema was not found', function(done) {
            var next = function() {
                expect(logger.warn).to.have.been.calledWith('JSON Schema for collectionName', 'people', 'not found.');
                done();
            };

            instanceService.build(next);
        });
    });
});