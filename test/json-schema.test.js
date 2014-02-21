var expect = require('chai').expect;
var loopback = require('loopback');

var app = loopback();
var initLoopbackJsonSchema = require('../index');
var JsonSchema = require('../models/json-schema');

describe('JsonSchema', function() {
    beforeEach(function() {
        initLoopbackJsonSchema(app);
    });

    describe('.beforeSave', function() {
        it('should add $schema property with draft-03 value');
    });
});
