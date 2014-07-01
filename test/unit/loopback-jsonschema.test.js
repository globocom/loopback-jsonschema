require('../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var CollectionSchema = require('../../lib/domain/collection-schema');
var config = require('../../lib/support/config');
var loopbackJsonSchema = require('../../index');

var app = loopback();

describe('loopbackJsonSchema', function() {
    describe('.init', function() {
        it('should allow overriding default config', function() {
            var myConfig = {
                CollectionSchemaClass: 'MyCollectionSchemaClass',
                jsonSchemaValidatorTranslation: {
                    draft4: {}
                },
                Model: 'MyModel',
                myConfigOption: 'myValue'
            };
            loopbackJsonSchema.init(app, myConfig);
            expect(config).to.eql({
                CollectionSchemaClass: 'MyCollectionSchemaClass',
                jsonSchemaValidatorTranslation: {
                    draft4: {}
                },
                logLevel: 'info',
                Model: 'MyModel',
                myConfigOption: 'myValue'
            });
        });

        after(function() {
            loopbackJsonSchema.init(app, { CollectionSchemaClass: CollectionSchema });
        });
    });
});
