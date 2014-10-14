var support = require('../support');

var expect = require('chai').expect;
var request = require('supertest');

var app = support.newLoopbackJsonSchemaApp();

describe('POST /item-schemas', function() {
    var itemSchema, itemSchemaResourceId, response, schemeAndAuthority;

    describe('successfully', function() {
        before(function(done) {
            var schemaJson = {
                'type': 'object',
                'modelName': 'person',
                'collectionName': 'people',
                links: [
                    {
                        rel: 'blog',
                        method: 'GET',
                        href: '{+blog}'
                    }
                ]
            };
            request(app)
                .post('/api/item-schemas')
                .set('Content-Type', 'application/schema+json')
                .send(JSON.stringify(schemaJson))
                .end(function (err, res) {
                    if (err) { return done(err); };
                    itemSchema = JSON.parse(res.text);
                    itemSchemaResourceId = itemSchema.resourceId;

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
        });

        it('should return 200', function() {
            expect(response.status).to.eq(200);
        });

        it('should return correct resourceId and id', function() {
            expect(itemSchema.resourceId).to.be.eq(itemSchemaResourceId);
        });

        it('should include default links', function() {
            expect(itemSchema.links).to.eql([
                    { rel: 'self', href: schemeAndAuthority + '/api/people/{id}' },
                    { rel: 'item', href: schemeAndAuthority + '/api/people/{id}' },
                    {
                        rel: 'create',
                        method: 'POST',
                        href: schemeAndAuthority + '/api/people',
                        schema: {
                            $ref: schemeAndAuthority + '/api/item-schemas/' + itemSchema.resourceId
                        }
                    },
                    { rel: 'update', method: 'PUT', href: schemeAndAuthority + '/api/people/{id}' },
                    { rel: 'delete', method: 'DELETE', href: schemeAndAuthority + '/api/people/{id}' },
                    { rel: 'blog', method: 'GET', href: '{+blog}' }
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
                    if (err) { return done(err); };
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
