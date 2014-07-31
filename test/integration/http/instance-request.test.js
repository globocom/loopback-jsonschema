var support = require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var logger = require('../../../lib/support/logger')
var LJSRequest = require('../../../lib/http/ljs-request');
var ItemSchema = require('../../../lib/domain/item-schema');
var instanceRequest = require('../../../lib/http/instance-request');

var app = support.newLoopbackJsonSchemaApp();

describe('instanceRequest', function() {
    describe('#handle', function() {
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
                if (err) { return done(err); }
                var Person = loopback.getModel('person');
                expect(Person).to.not.be.null;
                expect(Person.definition.name).to.equal('person');
                expect(Person.definition.settings.plural).to.equal('people');
                done();
            };

            ItemSchema.create({ modelName: 'person', collectionName: 'people' }, function(err) {
                if (err) { return done(err); }
                instanceRequest.handle(ljsReq, res, callback);
            });
        });
    });
});
