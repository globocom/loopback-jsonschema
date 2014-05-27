require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var loopbackJsonSchema = require('../../../index');
var logger = require('../../../lib/support/logger')
var LJSRequest = require('../../../lib/http/ljs-request');
var ItemSchema = require('../../../lib/domain/item-schema');
var instanceRequest = require('../../../lib/service/instance.service');

var app = loopback();
app.set('restApiRoot', '/api');

describe('instance.service', function() {
    describe('#build', function() {
        var ljsReq, res;

        beforeEach(function() {
            var req = { body: 'body', protocol: 'http', url: '/people', originalUrl: '/api/people', app: app, get: this.sinon.stub() };
            ljsReq = new LJSRequest(req, app);
            res = { set: this.sinon.stub() };

            this.sinon.stub(logger, 'info');
            this.sinon.stub(logger, 'warn');
        });

        it('should register loopback model for an existing collection JSON schema', function(done) {
            var callback = function(err) {
                if (err) { throw err; }
                var Person = loopback.getModel('person');
                expect(Person).to.not.be.null;
                expect(Person.definition.name).to.equal('person');
                expect(Person.definition.settings.plural).to.equal('people');
                done();
            };

            ItemSchema.create({ modelName: 'person', collectionName: 'people' }, function(err) {
                if (err) { throw err; }
                instanceRequest.handle(ljsReq, res, callback);
            });
        });
    });
});
