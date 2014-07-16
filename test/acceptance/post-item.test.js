var support = require('../support');

var expect = require('chai').expect;
var request = require('supertest');

var ItemSchema = require('../../lib/domain/item-schema');

var app = support.newLoopbackJsonSchemaApp();

describe('POST /:collection', function() {
    var itemResponse, jsonSchemaId, schemeAndAuthority;

    describe('successfully', function() {
        before(function (done) {
            ItemSchema.create({
                modelName: 'person',
                collectionName: 'people',
                title: 'Person',
                collectionTitle: 'People',
                type: 'object',
                properties: {}
            }, function(err, jsonSchema) {
                if (err) { throw err };
                jsonSchemaId = jsonSchema.id;
                done();
            });
        });

        before(function(done) {
            request(app)
                .post('/api/people')
                .set('Content-Type', 'application/json')
                .send('{"name": "Alice"}')
                .end(function (err, res) {
                    if (err) { throw err };
                    schemeAndAuthority = 'http://' + res.req._headers.host;
                    itemResponse = res;
                    done();
                });
        });

        it('should return 200', function() {
            expect(itemResponse.status).to.eq(200);
        });

        it('should correlate the item with its schema', function() {
            var itemSchemaUrl = schemeAndAuthority + '/api/item-schemas/' + jsonSchemaId;
            expect(itemResponse.headers['link']).to.eq('<' + itemSchemaUrl + '>; rel=describedby');
            expect(itemResponse.headers['content-type']).to.eq('application/json; charset=utf-8; profile=' + itemSchemaUrl);
        });
    });

    describe('with unsupported Content-Type', function() {
        before(function(done) {
            request(app)
                .post('/api/people')
                .set('Accept', 'application/json')
                .set('Content-Type', 'text/plain')
                .send('{"name": "Alice"}')
                .end(function (err, res) {
                    if (err) { throw err };
                    itemResponse = res;
                    done();
                });
        });

        it('should return 415', function() {
            expect(itemResponse.status).to.eq(415);
        });

        it('should return error message', function() {
            expect(itemResponse.body.error.message).to.eq('Unsupported Content-Type: <text/plain>.')
        });
    });

    describe('with validation errors', function() {
        before(function(done) {
            ItemSchema.create({
                modelName: 'person',
                collectionName: 'people',
                title: 'Person',
                collectionTitle: 'People',
                type: 'object',
                properties: {
                    name: {
                        type: 'string'
                    }
                },
                required: ['name']
            }, function(err, jsonSchema) {
                if (err) { throw err };
                jsonSchemaId = jsonSchema.id;
                done();
            });
        });

        before(function(done) {
            request(app)
                .post('/api/people')
                .set('Content-Type', 'application/json')
                .send('{}')
                .end(function (err, res) {
                    if (err) { throw err };
                    itemResponse = res;
                    done();
                });
        });

        it('should return 422 status code', function() {
            expect(itemResponse.status).to.eq(422);
        });

        it('should return errors in body', function() {
            var error = itemResponse.body.error;
            expect(error.details).to.eql({
                codes: {
                    '/name': [
                        302
                    ],
                    '_all': [
                        'custom'
                    ]
                },
                context: 'person',
                messages: {
                    '/name': [
                        'Missing required property: name'
                    ],
                    '_all': [
                        'Instance is invalid'
                    ]
                }
            });
            expect(error.message).to.contain('The `person` instance is not valid.');
            expect(error.message).to.contain('`_all` Instance is invalid');
            expect(error.message).to.contain('`/name` Missing required property: name');
            expect(error.name).to.eq('ValidationError');
            expect(error.status).to.eq(422);
            expect(error.statusCode).to.eq(422);
        });
    });
});