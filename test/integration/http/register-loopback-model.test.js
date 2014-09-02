var support = require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var logger = require('../../../lib/support/logger')
var LJSRequest = require('../../../lib/http/ljs-request');
var ItemSchema = require('../../../lib/domain/item-schema');
var registerLoopbackModel = require('../../../lib/http/register-loopback-model');

var app = support.newLoopbackJsonSchemaApp();

describe('registerLoopbackModel', function() {
    describe('#handle', function() {
        var ljsReq;

        beforeEach(function() {
            var req = { body: 'body', protocol: 'http', url: '/cars', originalUrl: '/api/cars', app: app, get: this.sinon.stub() };
            ljsReq = new LJSRequest(req, app);

            this.sinon.stub(logger, 'info');
            this.sinon.stub(logger, 'warn');
        });

        it('should register loopback model for an existing collection JSON schema', function(done) {
            var callback = function(err) {
                if (err) { return done(err); }
                app.models().splice(0, app.models().length);
                var Car = loopback.getModel('car');
                expect(Car).to.not.be.null;
                expect(Car.definition.settings.plural).to.equal('cars');
                done();
            };

            ItemSchema.create({ modelName: 'car', collectionName: 'cars' }, function(err) {
                if (err) { return done(err); }
                registerLoopbackModel.handle(ljsReq, callback);
            });
        });
    });
});
