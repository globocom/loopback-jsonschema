var support = require('../support');

var expect = require('chai').expect;
var request = require('supertest');

describe('POST /item-schemas', function() {
    var app, itemSchema, itemSchemaId, response, schemeAndAuthority;

    describe('successfully', function() {
        before(function(done) {
            app = support.newLoopbackJsonSchemaApp();
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
                    if (err) { return done(err); }
                    itemSchema = JSON.parse(res.text);
                    itemSchemaId = itemSchema.id;

                    schemeAndAuthority = 'http://' + res.req._headers.host;
                    response = res;
                    itemSchema = JSON.parse(res.text);
                    done();
                });
        });

        it('should return 201', function() {
            expect(response.status).to.eq(201);
        });

        it('should correlate the Location header', function(){
            var locationUrl = schemeAndAuthority + '/api/item-schemas/' + itemSchema.id;
            expect(response.headers['location']).to.eq(locationUrl);
        });

        it('should return correct id', function() {
            expect(itemSchema.id).to.be.eq(itemSchemaId);
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
                            $ref: schemeAndAuthority + '/api/item-schemas/' + itemSchema.id
                        }
                    },
                    { rel: 'update', method: 'PUT', href: schemeAndAuthority + '/api/people/{id}' },
                    { rel: 'delete', method: 'DELETE', href: schemeAndAuthority + '/api/people/{id}' },
                    { rel: 'parent', href: schemeAndAuthority + '/api/people' },
                    { rel: 'blog', method: 'GET', href: '{+blog}' }
                ]);
        });
    });

    describe('with unsupported Content-Type', function() {
        before(function(done) {
            app = support.newLoopbackJsonSchemaApp();
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

    describe('without required fields', function(){
        var bodyError;

        before(function(done) {
            var schemaJson = {
                type: 'object'
            };

            app = support.newLoopbackJsonSchemaApp();
            request(app)
                .post('/api/item-schemas')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(schemaJson))
                .end(function (err, res) {
                    if (err) { return done(err); };
                    response = res;
                    bodyError = JSON.parse(response.error.text);
                    done();
                });
        });

        it('should return a 422 error', function(){
            expect(response.status).to.eql(422);
        });

        it('should error be a ValidationError', function(){
            console.info(bodyError.error);
            expect(bodyError.error.name).to.eql('ValidationError');
        });

        it('should error have the message: "`collectionName` can\'t be blank"', function(){
            expect(bodyError.error.message).to.contain('`collectionName` can\'t be blank');
        });

        it('should error have the message: "`modelName` can\'t be blank"', function(){
            expect(bodyError.error.message).to.contain('`modelName` can\'t be blank');
        });
    });
});
