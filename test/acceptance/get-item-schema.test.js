var support = require('../support');

var expect = require('chai').expect;
var request = require('supertest');

var ItemSchema = require('../../lib/domain/item-schema');

var app = support.newLoopbackJsonSchemaApp();

describe('GET /item-schemas/:id', function() {
    describe('when schema exists', function() {
        var itemSchema, itemSchemaResourceId, response, schemeAndAuthority;

        before(function(done) {
            ItemSchema.create({
                modelName: 'person',
                collectionName: 'people',
                title: 'Person',
                collectionTitle: 'People',
                type: 'object',
                properties: {},
                links: [
                    { rel: 'custom', href: '/custom' }
                ]
            }, function(err, itemSchema) {
                if (err) { return done(err); };
                itemSchemaResourceId = itemSchema.resourceId;
                done();
            });
        });

        before(function(done) {
            request(app)
                .get('/api/item-schemas/' + itemSchemaResourceId)
                .expect(200)
                .end(function(err, res) {
                    if (err) { return done(err); };
                    schemeAndAuthority = 'http://' + res.req._headers.host;
                    response = res;
                    itemSchema = JSON.parse(res.text);
                    done();
                });
        });

        it('should have application/schema+json content type', function() {
            expect(response.headers['content-type']).to.eq('application/schema+json; charset=utf-8');
        });

        it('should include $schema', function() {
            expect(itemSchema['$schema']).to.eq('http://json-schema.org/draft-04/hyper-schema#');
        });

        it('should include type', function() {
            expect(itemSchema['type']).to.eq('object');
        });

        it('should include title', function() {
            expect(itemSchema['title']).to.eq('Person');
        });

        it('should include properties', function() {
            expect(itemSchema['properties']).to.eql({});
        });

        it('should include links', function() {
            expect(itemSchema['links']).to.eql([
                {
                    rel: 'self',
                    href: schemeAndAuthority + '/api/people/{id}'
                },
                {
                    rel: 'item',
                    href: schemeAndAuthority + '/api/people/{id}'
                },
                {
                    rel: 'create',
                    method: 'POST',
                    href: schemeAndAuthority + '/api/people',
                    schema: {
                        $ref: schemeAndAuthority + '/api/item-schemas/' + itemSchemaResourceId
                    }
                },
                {
                    rel: 'update',
                    method: 'PUT',
                    href: schemeAndAuthority + '/api/people/{id}'
                },
                {
                    rel: 'delete',
                    method: 'DELETE',
                    href: schemeAndAuthority + '/api/people/{id}'
                },
                {
                    rel: 'custom',
                    href: schemeAndAuthority + '/api/custom'
                }
            ]);
        });
    });

    describe('when schema does not exist', function() {
        it('should return 404', function (done) {
            request(app)
                .get('/api/item-schemas/invalid-schema-id')
                .expect(404)
                .end(function (err, res) {
                    if (err) { return done(err); };
                    expect(res.body).to.not.be.emtpy;
                    done();
            });
        });
    });
});
