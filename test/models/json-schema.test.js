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
        it('should set $schema property to hyper-schema draft-04', function() {
            var jsonSchema = {};
            JsonSchema.beforeSave(dummy, jsonSchema);
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-04/hyper-schema#');
        });
    });
});
