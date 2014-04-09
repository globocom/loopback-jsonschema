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
        it('should add $schema property with draft-03 value', function() {
            var jsonSchema = {};
            JsonSchema.beforeSave(dummy, jsonSchema);
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-03/hyper-schema#');
        });
    });
});
