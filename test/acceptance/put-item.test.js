var support = require('../support');

var expect = require('chai').expect;
var request = require('supertest');

var ItemSchema = require('../../lib/domain/item-schema');


describe('PUT /:collection/:id', function() {
    var app, itemResponse, itemId, jsonSchemaResourceId, schemeAndAuthority;
    before(function() {
        app = support.newLoopbackJsonSchemaApp();
    });

    describe('successfully', function() {
        before(function(done) {
            ItemSchema.create({
                modelName: 'person',
                collectionName: 'people',
                title: 'Person',
                collectionTitle: 'People',
                type: 'object',
                properties: {}
            }, function(err, jsonSchema) {
                if (err) { return done(err); };
                jsonSchemaResourceId = jsonSchema.resourceId;
                done();
            });
        });

        before(function(done) {
            request(app)
                .post('/api/people')
                .set('Content-Type', 'application/json')
                .send('{"name": "Alice"}')
                .end(function (err, item) {
                    if (err) { return done(err); };
                    itemId = item.body.id;
                    done();
                });
        });

        before(function(done) {
            request(app)
                .put('/api/people/' + itemId)
                .set('Content-Type', 'application/json')
                .send('{"name": "Alice", "age": 30}')
                .end(function (err, res) {
                    if (err) { return done(err); };
                    schemeAndAuthority = 'http://' + res.req._headers.host;
                    itemResponse = res;
                    done();
                });
        });

        it('should return 200 status code', function() {
            expect(itemResponse.status).to.eq(200);
        });

        it('should correlate the item with its schema', function() {
            var itemSchemaUrl = schemeAndAuthority + '/api/item-schemas/' + jsonSchemaResourceId;
            expect(itemResponse.headers['link']).to.eq('<' + itemSchemaUrl + '>; rel="describedby"');
            expect(itemResponse.headers['content-type']).to.eq('application/json; charset=utf-8; profile="' + itemSchemaUrl + '"');
        });
    });

    describe('successfully with a readOnly field', function() {
         before(function (done) {
            app = support.newLoopbackJsonSchemaApp();
            ItemSchema.create({
                modelName: 'person-readonly',
                collectionName: 'people-readonly',
                title: 'Person',
                collectionTitle: 'People-readonly',
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        readOnly: true
                    }
                }
            }, function(err, jsonSchema) {
                if (err) { return done(err); };
                jsonSchemaResourceId = jsonSchema.resourceId;
                done();
            });
        });

        before(function(done) {
            request(app)
                .post('/api/people-readonly')
                .set('Content-Type', 'application/json')
                .send('{"name": "Alice"}')
                .end(function (err, item) {
                    if (err) { return done(err); };
                    itemId = item.body.id;
                    done();
                });
        });

        before(function(done) {
            request(app)
                .put('/api/people-readonly/' + itemId)
                .set('Content-Type', 'application/json')
                .send('{"name": "Alice", "status": "top"}')
                .end(function (err, res) {
                    if (err) { return done(err); };
                    itemResponse = res;
                    done();
                });
        });

        it('should ignore posted property', function() {
            expect(itemResponse.body).to.not.include.keys('status');
        });
    });

    describe('successfully when the schema includes a default value', function(){
        before(function (done) {
            app = support.newLoopbackJsonSchemaApp();
            ItemSchema.create({
                modelName: 'person-readonly',
                collectionName: 'people-readonly',
                title: 'Person',
                collectionTitle: 'People-readonly',
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        default: 'inactive'
                    }
                }
            }, function(err, jsonSchema) {
                if (err) { return done(err); };
                jsonSchemaResourceId = jsonSchema.resourceId;
                done();
            });
        });

        before(function(done) {
            request(app)
                .post('/api/people-readonly')
                .set('Content-Type', 'application/json')
                .send('{"name": "Alice"}')
                .end(function (err, res) {
                    if (err) { return done(err); };
                    itemId = res.body.id;
                    done();
                });
        });

        before(function(done) {
            request(app)
                .put('/api/people-readonly/' + itemId)
                .set('Content-Type', 'application/json')
                .send('{"name": "Alice"}')
                .end(function (err, res) {
                    if (err) { return done(err); };
                    itemResponse = res;
                    done();
                });
        });

        it('should set default value', function() {
            expect(itemResponse.body.status).to.eql('inactive');
        });
    });

    describe('with unsupported Content-Type', function() {
        before(function(done) {
            request(app)
                .put('/api/people/123')
                .set('Accept', 'application/json')
                .set('Content-Type', 'text/plain')
                .send('{"name": "Alice"}')
                .end(function (err, res) {
                    if (err) { return done(err); };
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
                        type: 'string',
                        minLength: 1
                    }
                },
                required: ['name']
            }, function(err, jsonSchema) {
                if (err) { return done(err); };
                jsonSchemaResourceId = jsonSchema.resourceId;
                done();
            });
        });

        before(function(done) {
            request(app)
                .post('/api/people')
                .set('Content-Type', 'application/json')
                .send('{"name": "Alice"}')
                .end(function (err, item) {
                    if (err) { return done(err); };
                    itemId = item.body.id;
                    done();
                });
        });

        before(function(done) {
            request(app)
                .put('/api/people/' + itemId)
                .set('Content-Type', 'application/json')
                .send('{"name": ""}')
                .end(function (err, res) {
                    if (err) { return done(err); };
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
                        200
                    ],
                    '_all': [
                        'custom'
                    ]
                },
                context: 'person',
                messages: {
                    '/name': [
                        'String is too short (0 chars), minimum 1'
                    ],
                    '_all': [
                        'Instance is invalid'
                    ]
                }
            });
            expect(error.message).to.contain('The `person` instance is not valid.');
            expect(error.message).to.contain('`_all` Instance is invalid');
            expect(error.message).to.contain('`/name` String is too short (0 chars), minimum 1');
            expect(error.name).to.eq('ValidationError');
            expect(error.status).to.eq(422);
            expect(error.statusCode).to.eq(422);
        });
    });
});
