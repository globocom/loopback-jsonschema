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
        it('should set $schema', function() {
            JsonSchema.create({modelName: 'test'}, function(_, jsonSchema) {
                expect(jsonSchema.$schema).to.exist;
            });
        });

        it('should add links', function() {
            JsonSchema.create({modelName: 'test'}, function(_, jsonSchema) {
                var rels = jsonSchema.links.map(function(link) {
                    return link.rel;
                });
                ['self', 'item', 'update', 'delete'].forEach(function(expectedRel) {
                    expect(rels.indexOf(expectedRel)).to.be.at.least(0);
                });
            });
        });

        it('should create model defined by the json schema provided', function() {
            JsonSchema.create({modelName: 'test'}, function() {
                expect(loopback.getModel('test')).to.exist;
            });
        });
    });
});
