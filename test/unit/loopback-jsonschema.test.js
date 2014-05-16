require('../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var config = require('../../lib/support/config');

var app = loopback();

describe('loopbackJsonSchema', function() {
    describe('.init', function() {
        it('should allow overriding default config', function() {
            var myConfig = {CollectionSchemaClass: 'MyCollectionSchemaClass', myConfigOption: 'myValue'};
            loopbackJsonSchema.initLoopbackJsonSchema(app, myConfig);
            expect(config).to.eql({CollectionSchemaClass: 'MyCollectionSchemaClass', myConfigOption: 'myValue'});
        });
    });
});
