require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var loopbackJsonSchema = require('../../../index');
var logger = require('../../../lib/support/logger')
var LJSRequest = require('../../../lib/http/ljs-request');
var ItemSchema = require('../../../lib/models/item-schema');
var InstanceService = require('../../../lib/service/instance.service');

var app = loopback();
app.set('restApiRoot', '/api');

describe('instance.service', function() {
    describe('#build', function() {
        beforeEach(function() {
            var req = { body: 'body', protocol: 'http', url: '/people', originalUrl: '/api/people', app: app, get: this.sinon.stub() };
            var ljsReq = new LJSRequest(req, app);
            this.res = { set: this.sinon.stub() };
            this.instanceService = new InstanceService(ljsReq, this.res);

            this.sinon.stub(logger, 'info');
            this.sinon.stub(logger, 'warn');
        });

        it('should register loopback model for an existing collection JSON schema', function(done) {
            var jsonSchema = ItemSchema.create({ modelName: 'person', collectionName: 'people' });

            var next = function() {
                var Person = loopback.getModel('person');
                expect(Person).to.not.be.null;
                expect(Person.definition.name).to.equal('person');
                expect(Person.definition.settings.plural).to.equal('people');
                done();
            };
            this.instanceService.build(next);

            ItemSchema.remove({ modelName: 'person' });
        });

        it('should log when collection JSON schema was not found', function(done) {
            var next = function() {
                expect(logger.warn).to.have.been.calledWith('JSON Schema for collectionName', 'people', 'not found.');
                done();
            };

            this.instanceService.build(next);
        });
    });
});
