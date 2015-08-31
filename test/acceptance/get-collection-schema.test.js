var support = require('../support');

var expect = require('chai').expect;
var request = require('supertest');

var ItemSchema = require('../../lib/domain/item-schema');


describe('GET /collection-schemas/:id', function () {
    var app;

    before(function() {
        app = support.newLoopbackJsonSchemaApp();
    });

    describe('when corresponding item schema exists', function () {
        var collectionSchema,
            collectionSchemaResponse,
            collectionSchemaCollectionName,
            schemeAndAuthority;

        before(function (done) {
            ItemSchema.create({
                collectionName: 'people',
                title: 'Person',
                collectionTitle: 'People',
                type: 'object',
                properties: {},
                collectionLinks: [
                    { rel: 'custom', href: '/custom' }
                ]
            }, function(err, itemSchema) {
                if (err) { return done(err); }
                collectionSchemaCollectionName = itemSchema.collectionName;
                done();
            });
        });

        before(function(done) {
            request(app)
                .get('/api/collection-schemas/' + collectionSchemaCollectionName)
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    schemeAndAuthority = 'http://' + res.req._headers.host;
                    collectionSchemaResponse = res;
                    collectionSchema = JSON.parse(res.text);
                    done();
            });
        });

       it('should have application/schema+json content type', function() {
            expect(collectionSchemaResponse.headers['content-type']).to.eq('application/schema+json; charset=utf-8');
        });

        it('should include CORS headers', function() {
            expect(collectionSchemaResponse.headers['access-control-allow-origin']).to.eq('*');
        });

        it('should include $schema', function() {
            expect(collectionSchema['$schema']).to.eq('http://json-schema.org/draft-04/hyper-schema#');
        });

        it('should include type', function() {
            expect(collectionSchema['type']).to.eq('array');
        });

        it('should include title', function() {
            expect(collectionSchema['title']).to.eq('People');
        });

        it('should include items', function() {
            expect(collectionSchema['items']).to.eql({
                $ref: schemeAndAuthority + '/api/item-schemas/' + collectionSchemaCollectionName
            });
        });

        it('should not include properties', function() {
            expect(collectionSchema['properties']).to.be.undefined;
        });

        it('should include links', function() {
            expect(collectionSchema['links']).to.eql([
                {
                    rel: 'self',
                    href: schemeAndAuthority + '/api/people'
                },
                {
                    rel: 'add',
                    method: 'POST',
                    href: schemeAndAuthority + '/api/people',
                    schema: {
                        $ref: schemeAndAuthority + '/api/item-schemas/' + collectionSchemaCollectionName
                    }
                },
                {
                    rel: 'previous',
                    href: schemeAndAuthority + '/api/people?filter[limit]={limit}&filter[offset]={previousOffset}{&paginateQs*}'
                },
                {
                    rel: 'next',
                    href: schemeAndAuthority + '/api/people?filter[limit]={limit}&filter[offset]={nextOffset}{&paginateQs*}'
                },
                {
                    rel: 'page',
                    href: schemeAndAuthority + '/api/people?filter[limit]={limit}&filter[offset]={offset}{&paginateQs*}'
                },
                {
                    rel: 'order',
                    href: schemeAndAuthority + '/api/people?filter[order]={orderAttribute}%20{orderDirection}{&orderQs*}'
                },
                {
                    rel: 'custom',
                    href: schemeAndAuthority + '/api/custom'
                }
            ]);
        });
    });

    describe('when corresponding item schema does not exist', function () {
        it('should return 404', function (done) {
            request(app)
                .get('/api/collection-schemas/invalid-schema-id')
                .expect(404)
                .end(function (err) {
                    if (err) { return done(err); }
                    done();
            });
        });
    });
});
