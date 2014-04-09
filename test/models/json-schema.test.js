var expect = require('chai').expect;
var loopback = require('loopback');

var app = loopback();
var initLoopbackJsonSchema = require('../../index');
var JsonSchema = require('../../models/json-schema');

describe('JsonSchema', function() {
    var dummy = function() {};

    beforeEach(function() {
        initLoopbackJsonSchema(app);
    });

    describe('.beforeSave', function() {
        it('should set $schema to hyper-schema draft-04 by default', function() {
            var jsonSchema = {};
            JsonSchema.beforeSave(dummy, jsonSchema);
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-04/hyper-schema#');
        });

        it('should allow overriding of $schema', function() {
            var jsonSchema = {$schema: 'http://json-schema.org/draft-03/hyper-schema#'};
            JsonSchema.beforeSave(dummy, jsonSchema);
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-03/hyper-schema#');
        });
    });

    describe('.afterSave', function() {
        it('should create model defined by the json schema provided', function() {
            JsonSchema.create({'title': 'test'}, function() {
                expect(loopback.getModel('test')).to.exist;
            });
        });
    });
});
