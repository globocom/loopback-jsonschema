var expect = require('chai').expect;
var sinon = require('sinon');


var loopback = require('loopback');

var app = loopback();
var loopbackJsonSchema = require('../../../index');
var JsonSchema = require('../../../models/json-schema');

describe('JsonSchema', function() {
    beforeEach(function() {
        loopbackJsonSchema.initLoopbackJsonSchema(app);
    });

    describe('.create', function() {
        it('should set $schema', function() {
            JsonSchema.create({modelName: 'test'}, function(_, jsonSchema) {
                expect(jsonSchema.$schema).to.exist;
            });
        });

        it('should create model defined by the json schema provided', function() {
            JsonSchema.create({modelName: 'test'}, function() {
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

    describe('.registerLoopbackModelForCollection', function() {
        it('should register loopback model for an existing collection JSON schema', function(done) {
            var jsonSchema = JsonSchema.create({ modelName: 'person', collectionName: 'people' });

            var next = function() {
                var Person = loopback.getModel('person');
                expect(Person).to.not.be.null;
                expect(Person.definition.name).to.equal("person");
                expect(Person.definition.settings.plural).to.equal("people");
                done();
            };
            JsonSchema.registerLoopbackModelForCollection("people", app, next);

            JsonSchema.remove({ modelName: 'person' });
        });

        it('should log when collection JSON schema was not found', function(done) {
            var log = sinon.stub(console, "warn");
            var next = function() {
                expect(log).to.have.been.calledWith("JSON Schema for collectionName:", "people", "Not found.");
                done();
            };

            JsonSchema.registerLoopbackModelForCollection("people", app, next);
        });
    });
});
