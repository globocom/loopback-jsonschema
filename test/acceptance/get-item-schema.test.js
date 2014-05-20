require('../support');

var expect = require('chai').expect;
var loopback = require('loopback');
var request = require('supertest');

var JsonSchema = require('../../lib/models/json-schema');
var jsonSchemaMiddleware = require('../../lib/middleware/json-schema.middleware');
var loopbackJsonSchema = require('../../index');

var app = loopback();
app.set('restApiRoot', '/api');
loopbackJsonSchema.init(app);
app.installMiddleware();

describe('GET /item-schemas/:id', function() {
    describe('when schema exists', function() {
        var itemSchema, itemSchemaId, schemeAndAuthority;

        before(function(done) {
            JsonSchema.create({
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
                if (err) { throw err };
                itemSchemaId = itemSchema.id;
                done();
            });
        });

        before(function(done) {
            request(app)
                .get('/api/json-schemas/' + itemSchemaId)
                .expect(200)
                .end(function(err, res) {
                    if (err) { throw err };
                    schemeAndAuthority = 'http://' + res.req._headers.host;
                    itemSchema = res.body;
                    done();
                });
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
                .get('/api/json-schemas/invalid-schema-id')
                .expect(404)
                .end(function (err, res) {
                    if (err) { throw err };
                    expect(res.body).to.not.be.emtpy;
                    done();
            });
        });
    });
});
