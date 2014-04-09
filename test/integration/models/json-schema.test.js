var expect = require('chai').expect;
var loopback = require('loopback');

var app = loopback();
var initLoopbackJsonSchema = require('../../../index');
var JsonSchema = require('../../../models/json-schema');

describe('JsonSchema', function() {
    beforeEach(function() {
        initLoopbackJsonSchema(app);
    });

    describe('.create', function() {
        it('should create model defined by the json schema provided', function() {
            JsonSchema.create({'title': 'test'}, function() {
                expect(loopback.getModel('test')).to.exist;
            });
        });
    });
});
