var expect = require('chai').expect;
var loopback = require('loopback');

var app = loopback();
var initLoopbackJsonSchema = require('../../../index');
var jsonSchemaHooks = require('../../../models/json-schema-hooks');

describe('jsonSchemaHooks', function() {
    var dummy = function() {};

    beforeEach(function() {
        initLoopbackJsonSchema(app);
    });

    describe('.beforeSave', function() {
        it('should set $schema to hyper-schema draft-04 by default', function() {
            var jsonSchema = {};
            jsonSchemaHooks.beforeSave(dummy, jsonSchema);
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-04/hyper-schema#');
        });

        it('should allow overriding of $schema', function() {
            var jsonSchema = {$schema: 'http://json-schema.org/draft-03/hyper-schema#'};
            jsonSchemaHooks.beforeSave(dummy, jsonSchema);
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-03/hyper-schema#');
        });
    });

    describe('.afterSave', function() {
        it('should create model defined by the json schema provided', function() {
            var jsonSchema = {'title': 'test'};
            jsonSchemaHooks.afterSave(dummy, jsonSchema, app);
            expect(loopback.getModel('test')).to.exist;
        });
    });
});
