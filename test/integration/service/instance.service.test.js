require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var loopbackJsonSchema = require('../../../index');
var logger = require('../../../lib/support/logger')
var LJSRequest = require('../../../lib/models/ljs-request');
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

    describe('#addHeaders', function() {
        var itemSchema;

        beforeEach(function (done) {
            ItemSchema.create({
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

            this.baseUrl = 'http://example.org/api';
        });

        describe('when url represents an item', function() {
            beforeEach(function () {
                var req = { protocol: 'http', app: app, url: '/people/' + itemSchema.id, originalUrl: '/api/people/' + itemSchema.id };
                req.get = this.sinon.stub();
                req.get.withArgs('Host').returns('example.org');
                var ljsReq = new LJSRequest(req, app);

                this.res = { set: this.sinon.stub() };
                this.instanceService = new InstanceService(ljsReq, this.res);
            });

            it('should build the url with "json-schemas"', function () {
                this.instanceService.addHeaders(itemSchema);

                expect(this.res.set).to.have.been.called.twice;
                expect(this.res.set).to.have.been.calledWith('Content-Type', "application/json; charset=utf-8; profile=" + this.baseUrl + "/json-schemas/" + itemSchema.id);
                expect(this.res.set).to.have.been.calledWith('Link', '<' + this.baseUrl + '/json-schemas/' + itemSchema.id + '>; rel=describedby');
            });
        });

        describe('when url represents a collection and the method is GET', function() {
            beforeEach(function () {
                var req = { protocol: 'http', app: app, url: '/people', originalUrl: '/api/people', method: 'GET' };
                req.get = this.sinon.stub();
                req.get.withArgs('Host').returns('example.org');
                var ljsReq = new LJSRequest(req, app);

                this.res = { set: this.sinon.stub() };
                this.instanceService = new InstanceService(ljsReq, this.res);
            });

            it('should build the url with "collection-schemas"', function () {
                this.instanceService.addHeaders(itemSchema);

                expect(this.res.set).to.have.been.called.twice;
                expect(this.res.set).to.have.been.calledWith('Content-Type', "application/json; charset=utf-8; profile=" + this.baseUrl + "/collection-schemas/" + itemSchema.id);
                expect(this.res.set).to.have.been.calledWith('Link', '<' + this.baseUrl + '/collection-schemas/' + itemSchema.id + '>; rel=describedby');
            });
        });

        describe('when url represents a collection and the method is not GET', function() {
            beforeEach(function () {
                var req = { protocol: 'http', app: app, url: '/people', originalUrl: '/api/people', method: 'NOTGET' };
                req.get = this.sinon.stub();
                req.get.withArgs('Host').returns('example.org');
                var ljsReq = new LJSRequest(req, app);

                this.res = { set: this.sinon.stub() };
                this.instanceService = new InstanceService(ljsReq, this.res);
            });

            it('should build the url with "collection-schemas"', function () {
                this.instanceService.addHeaders(itemSchema);

                expect(this.res.set).to.have.been.called.twice;
                expect(this.res.set).to.have.been.calledWith('Content-Type', "application/json; charset=utf-8; profile=" + this.baseUrl + "/json-schemas/" + itemSchema.id);
                expect(this.res.set).to.have.been.calledWith('Link', '<' + this.baseUrl + '/json-schemas/' + itemSchema.id + '>; rel=describedby');
            });
        });
    });
});