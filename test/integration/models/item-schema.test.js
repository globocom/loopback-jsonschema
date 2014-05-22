require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var loopbackJsonSchema = require('../../../index');
var logger = require('../../../lib/support/logger')
var JsonSchema = require('../../../lib/models/item-schema');
var LJSRequest = require('../../../lib/models/ljs-request');

var app = loopback();

describe('JsonSchema', function() {
    beforeEach(function() {
        loopbackJsonSchema.init(app);
    });

    describe('.findOne', function() {
        beforeEach(function(done) {
            JsonSchema.create({modelName: 'test'}, function(err, instance) {
                if (err) { throw err };
                done();
            });
        });

        it('should have $schema', function() {
            JsonSchema.findOne({where: {modelName: 'test'}}, function(err, jsonSchema) {
                if (err) {
                    logger.log(err);
                }
                expect(jsonSchema.$schema).to.exist;
            });
        });
    });

    describe('.create', function() {
        it('should set $schema', function() {
            JsonSchema.create({modelName: 'test'}, function(err, jsonSchema) {
                if (err) {
                    logger.log(err);
                }
                expect(jsonSchema.$schema).to.exist;
            });
        });

        it('should create model defined by the json schema provided', function() {
            JsonSchema.create({modelName: 'test'}, function(err) {
                if (err) {
                    logger.log(err);
                }
                expect(loopback.getModel('test')).to.exist;
            });
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

    describe('.findByCollectionName', function() {
        beforeEach(function() {
            this.sinon.stub(logger, 'info');
            this.sinon.stub(logger, 'warn');
        });

        it('should find JsonSchema collection by name and execute provided callback', function(done) {
            var jsonSchema = JsonSchema.create({ modelName: 'person', collectionName: 'people' });

            var callback = this.sinon.spy();
            var next = function() {
                expect(callback).to.have.been.called;
                done();
            };

            JsonSchema.findByCollectionName('people', next, callback)

            JsonSchema.remove({ modelName: 'person' });
        });

        it('should log when collection JSON schema was not found', function(done) {
            var next = function() {
                expect(logger.warn).to.have.been.calledWith('JSON Schema for collectionName', 'people', 'not found.');
                done();
            };

            JsonSchema.findByCollectionName('people', next, null);
        });
    });
});
