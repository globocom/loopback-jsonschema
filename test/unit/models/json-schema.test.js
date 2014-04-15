var expect = require('chai').expect;
var loopback = require('loopback');

var app = loopback();
var JsonSchema = require('../../../models/json-schema');

describe('JsonSchema', function() {
    describe('.addLinks', function() {
        var req = {};

        xdescribe('with no custom links', function() {
            beforeEach(function() {
                req.protocol = 'http';
                req.body = { collectionName: 'people' };
                JsonSchema.addLinks(req, app);
            });

            it('should include default links', function() {
                expect(req.body.links[0]).to.eql({ rel: 'self', href: 'http://example.org/api/people/{id}' });
                expect(req.body.links[1]).to.eql({ rel: 'item', href: 'http://example.org/api/people/{id}' });
                expect(req.body.links[2]).to.eql({ rel: 'update', method: 'PUT', href: 'http://example.org/api/people/{id}' });
                expect(req.body.links[3]).to.eql({ rel: 'delete', method: 'DELETE', href: 'http://example.org/api/people/{id}' });
            });
        });

        xdescribe('with custom links', function() {
            beforeEach(function() {
                req.body = {
                    collectionName: 'people',
                    links: [
                        { rel: 'custom', href: 'http://example.org/api/people/custom' },
                        { rel: 'item', href: 'http://example.org/api/people/override/item' }
                    ]
                };
                JsonSchema.addLinks(req, app);
            });

            it('should include default links', function() {
                expect(req.body.links[0]).to.eql({ rel: 'self', href: 'http://example.org/api/people/{id}' });
                expect(req.body.links[1]).to.eql({ rel: 'item', href: 'http://example.org/api/people/{id}' });
                expect(req.body.links[2]).to.eql({ rel: 'update', method: 'PUT', href: 'http://example.org/api/people/{id}' });
                expect(req.body.links[3]).to.eql({ rel: 'delete', method: 'DELETE', href: 'http://example.org/api/people/{id}' });
            });

            it('should include custom links', function() {
                expect(req.body.links[4]).to.eql({ rel: 'custom', href: 'http://example.org/api/people/custom' });
            });

            it('should not allow overriding default links', function() {
                expect(req.body.links).to.have.length(5);
                expect(req.body.links[1]).to.eql({ rel: 'item', href: 'http://example.org/api/people/{id}' });
            });
        });
    });

    describe('#update$schema', function() {
        it('should set $schema to hyper-schema draft-04 by default', function() {
            var jsonSchema = new JsonSchema();
            jsonSchema.update$schema();
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-04/hyper-schema#');
        });

        it('should allow overriding of $schema', function() {
            var jsonSchema = new JsonSchema({$schema: 'http://json-schema.org/draft-03/hyper-schema#'});
            jsonSchema.update$schema();
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-03/hyper-schema#');
        });
    });

    describe('#createLoopbackModel', function() {
        var Test;

        beforeEach(function() {
            var jsonSchema = new JsonSchema({modelName: 'test', collectionName: 'testplural'});
            jsonSchema.createLoopbackModel(app);
            Test = loopback.getModel('test');
        });

        it('should create model defined by this json schema', function() {
            expect(Test).to.exist;
        });

        it("should use collectionName as model's plural", function() {
            expect(Test.pluralModelName).to.equal('testplural');
        });
    });
});
