var support = require('../support');

var expect = require('chai').expect;
var request = require('supertest');

var ItemSchema = require('../../lib/domain/item-schema');

var app = support.newLoopbackJsonSchemaApp();

describe('GET /item-schemas', function() {
    describe('when there is an item-schema', function() {
        var itemSchemas, itemSchemaId, response, schemeAndAuthority;

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
            }, function(err, itemSchemas) {
                if (err) { return done(err); };
                itemSchemaId = itemSchemas.id;
                done();
            });
        });

        before(function(done) {
            request(app)
                .get('/api/item-schemas')
                .expect(200)
                .end(function(err, res) {
                    if (err) { return done(err); };
                    schemeAndAuthority = 'http://' + res.req._headers.host;
                    response = res;
                    itemSchemas = JSON.parse(res.text);
                    done();
                });
        });

        it('should include links', function() {
            expect(itemSchemas[0]['links']).to.eql([
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
                        $ref: schemeAndAuthority + '/api/item-schemas/' + itemSchemaId
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
});
