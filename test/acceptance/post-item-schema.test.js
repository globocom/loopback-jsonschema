var support = require('../support');

var expect = require('chai').expect;
var request = require('supertest');

var app = support.newLoopbackJsonSchemaApp();

describe('POST /item-schemas', function() {
    var itemSchemas, response, schemeAndAuthority;

    describe('successfully', function() {
        before(function(done) {
            var schemaJson = {
                'type': 'object',
                'modelName': 'person',
                'collectionName': 'people'
            };
            request(app)
                .post('/api/item-schemas')
                .set('Content-Type', 'application/schema+json')
                .send(JSON.stringify(schemaJson))
                .end(function (err, res) {
                    if (err) { throw err };
                    schemeAndAuthority = 'http://' + res.req._headers.host;
                    response = res;
                    itemSchemas = JSON.parse(res.text);
                    done();
                });
        });

        it('should return 200', function() {
            expect(response.status).to.eq(200);
        });

        it('should include default links', function() {
            expect(itemSchemas.links).to.eql([
                    { rel: 'self', href: schemeAndAuthority + '/api/people/{id}' },
                    { rel: 'item', href: schemeAndAuthority + '/api/people/{id}' },
                    {
                        rel: 'create',
                        method: 'POST',
                        href: schemeAndAuthority + '/api/people',
                        schema: {
                            $ref: schemeAndAuthority + '/api/item-schemas/' + itemSchemas.id
                        }
                    },
                    { rel: 'update', method: 'PUT', href: schemeAndAuthority + '/api/people/{id}' },
                    { rel: 'delete', method: 'DELETE', href: schemeAndAuthority + '/api/people/{id}' }
                ]);
        });
    });

    describe('with unsupported Content-Type', function() {
        before(function(done) {
            var schemaJson = {
                'type': 'object',
                'modelName': 'person',
                'collectionName': 'people'
            };
            request(app)
                .post('/api/item-schemas')
                .set('Accept', 'application/json')
                .set('Content-Type', 'text/plain')
                .send(JSON.stringify(schemaJson))
                .end(function (err, res) {
                    if (err) { throw err };
                    response = res;
                    done();
                });
        });

        it('should return 415', function() {
            expect(response.status).to.eq(415);
        });

        it('should return error message', function() {
            expect(response.body.error.message).to.eq('Unsupported Content-Type: <text/plain>.')
        });
    });
});
