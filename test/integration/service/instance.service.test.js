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
        var req = { body: 'body', protocol: 'http', url: '/people', app: app, get: this.sinon.stub() };

        ljsReq = new LJSRequest(req, app);
        this.res = { set: this.sinon.stub() };

        instanceService = new InstanceService(ljsReq, this.res);
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

    describe('#addHeaders', function() {
        var itemSchema, baseUrl;

        beforeEach(function (done) {
            JsonSchema.create({
                modelName: 'person',
                collectionName: 'people',
                title: 'Person',
                collectionTitle: 'People',
                type: 'object',
                properties: {}
            }, function(err, jsonSchema) {
                if (err) { throw err };
                itemSchema = jsonSchema;
                done();
            });

            baseUrl = 'http://example.org/api';
            this.sinon.stub(ljsReq, 'baseUrl').returns(baseUrl);
        });

        describe('when accessing an item', function() {
            it('should use json-schemas collection', function () {
                ljsReq.resourceId = itemSchema.id;
                instanceService.addHeaders(itemSchema);

                expect(this.res.set).to.have.been.called.twice;
                expect(this.res.set).to.have.been.calledWith('Content-Type', "application/json; charset=utf-8; profile=" + baseUrl + "/json-schemas/" + itemSchema.id);
                expect(this.res.set).to.have.been.calledWith('Link', '<' + baseUrl + '/json-schemas/' + itemSchema.id + '>; rel=describedby');
            });
        });

        describe('when accessing a collection', function() {
            it('should use collection-schemas collection', function () {
                instanceService.addHeaders(itemSchema);

                expect(this.res.set).to.have.been.called.twice;
                expect(this.res.set).to.have.been.calledWith('Content-Type', "application/json; charset=utf-8; profile=" + baseUrl + "/collection-schemas/" + itemSchema.id);
                expect(this.res.set).to.have.been.calledWith('Link', '<' + baseUrl + '/collection-schemas/' + itemSchema.id + '>; rel=describedby');
            });
        });

    });
});