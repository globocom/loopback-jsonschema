var support = require('../support');

var expect = require('chai').expect;
var request = require('supertest');

var ItemSchema = require('../../lib/domain/item-schema');


describe('PUT /:collection/:id', function() {
    var app, itemResponse, itemId, jsonSchemaId, schemeAndAuthority;
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
                jsonSchemaId = jsonSchema.id;
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
            var itemSchemaUrl = schemeAndAuthority + '/api/item-schemas/' + jsonSchemaId;
            expect(itemResponse.headers['link']).to.eq('<' + itemSchemaUrl + '>; rel="describedby"');
            expect(itemResponse.headers['content-type']).to.eq('application/json; charset=utf-8; profile="' + itemSchemaUrl + '"');
        });
    });

    describe('successfully with readOnly and default fields', function() {
        before(function (done) {
            app = support.newLoopbackJsonSchemaApp();
            ItemSchema.create({
                modelName: 'person-readonly',
                collectionName: 'people-readonly',
                title: 'Person',
                collectionTitle: 'People-readonly',
                type: 'object',
                properties: {
                    personal: {
                        type: 'object',
                        properties: {
                            firstName: {type: 'string'},
                            lastName: {type: 'string', default: 'Junior'},
                            active: {type: 'boolean', default: true, readOnly: true},
                            status: {type: 'string', default: 'single', readOnly: false}
                        }
                    },
                    professional: {
                        type: 'object',
                        properties: {
                            awards: {
                                type: 'array',
                                items: [
                                    {type: 'string'}
                                ],
                                additionalItems: {type: 'boolean', default: true}
                            },
                            jobs: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        company: {type: 'string'}
                                    }
                                }
                            }
                        }

                    }
                }
            }, function(err, jsonSchema) {
                if (err) { return done(err); };
                jsonSchemaId = jsonSchema.id;

                var person = {
                    personal: {
                        firstName: 'Bob',
                        active: false,
                        status: 'maried'
                    },
                    professional: {
                        awards: ['inovation', false, true],
                        jobs: [{company: 'Globo.com'}, {company: 'TV Globo'}]
                    }
                };

                request(app)
                    .post('/api/people-readonly')
                    .set('Content-Type', 'application/json')
                    .send(JSON.stringify(person))
                    .end(function (err, item) {
                        if (err) { return done(err); };
                        itemId = item.body.id;

                        done();
                    });
            });
        });

        before(function(done) {
            request(app)
                .put('/api/people-readonly/' + itemId)
                .set('Content-Type', 'application/json')
                .send('{"personal": {"active": false}}')
                .end(function (err, res) {
                    if (err) { return done(err); };
                    itemResponse = res;
                    done();
                });
        });

        it('should ignore posted property', function() {
            expect(itemResponse.body.personal.active).to.be.true;
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
                jsonSchemaId = jsonSchema.id;
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
                jsonSchemaId = jsonSchema.id;
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
