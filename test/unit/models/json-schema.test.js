var expect = require('chai').expect;
var loopback = require('loopback');

var app = loopback();
var JsonSchema = require('../../../models/json-schema');

describe('JsonSchema', function() {
    describe('#update$schema', function() {
        it('should set $schema to hyper-schema draft-04 by default', function() {
            var jsonSchema = new JsonSchema();
            jsonSchema.update$schema();
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-04/hyper-schema#');
        });

        it('should allow overriding of $schema', function() {
            var jsonSchemaProperties = {$schema: 'http://json-schema.org/draft-03/hyper-schema#'};
            var jsonSchema = new JsonSchema();
            jsonSchema.update$schema(jsonSchemaProperties);
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-03/hyper-schema#');
        });
    });

    describe('#addLinks', function() {
        it('should add default links', function() {
            var jsonSchema = new JsonSchema({title: 'person'});
            jsonSchema.addLinks();
            expect(jsonSchema.links[0]).to.eql({rel: 'self', href: 'http://localhost:3000/api/people/{id}'});
            expect(jsonSchema.links[1]).to.eql({rel: 'item', href: 'http://localhost:3000/api/people/{id}'});
            expect(jsonSchema.links[2]).to.eql({rel: 'update', method: 'PUT', href: 'http://localhost:3000/api/people/{id}'});
            expect(jsonSchema.links[3]).to.eql({rel: 'delete', method: 'DELETE', href: 'http://localhost:3000/api/people/{id}'});
        });
    });

    describe('#createLoopbackModel', function() {
        it('should create model defined by this json schema', function() {
            var jsonSchema = new JsonSchema({title: 'test'});
            jsonSchema.createLoopbackModel(app);
            expect(loopback.getModel('test')).to.exist;
        });
    });
});
