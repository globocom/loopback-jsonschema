var support = require('../support');

var expect = require('chai').expect;
var request = require('supertest');
var async = require('async');


describe('belongsTo relation', function(){
    var personId;
    var petId;
    var app;

    before(function(done) {
        app = support.newLoopbackJsonSchemaApp();

        var personSchema = {
            'type': 'object',
            'modelName': 'person',
            'collectionName': 'people',
            properties: {
                name: {type: 'string'}
            }
        };

        request(app)
            .post('/api/item-schemas')
            .set('Content-Type', 'application/schema+json')
            .send(JSON.stringify(personSchema))
            .end(function (err, res) {
                if (err) { return done(err); }
                expect(res.statusCode).to.be.eql(201);
                done();
            });
    });

    before(function(done) {
        var petSchema = {
            'type': 'object',
            'modelName': 'pet',
            'collectionName': 'pets',
            properties: {
                name: {type: 'string'},
                personId: {type: 'number'}
            },
            relations: {
                owner: {
                    collectionName: 'people',
                    type: 'belongsTo',
                    foreignKey: 'personId'
                }
            }
        };
        request(app)
            .post('/api/item-schemas')
            .set('Content-Type', 'application/schema+json')
            .send(JSON.stringify(petSchema))
            .end(function (err, res) {
                if (err) { return done(err); }
                expect(res.statusCode).to.be.eql(201);
                done();
            });
    });

    before(function(done) {
        var person = {
            name: "I am a person"
        };
        request(app)
            .post('/api/people')
            .set('Content-Type', 'application/schema+json')
            .send(JSON.stringify(person))
            .end(function (err, res) {
                if (err) { return done(err); }
                personId = res.body.id;
                expect(res.statusCode).to.be.eql(201);
                done();
            });
    });

    before(function(done) {
        var pet = {
            name: "my pet",
            personId: personId
        };
        request(app)
            .post('/api/pets')
            .set('Content-Type', 'application/schema+json')
            .send(JSON.stringify(pet))
            .end(function (err, res) {
                if (err) { return done(err); }
                petId = res.body.id;
                expect(res.statusCode).to.be.eql(201);
                done();
            });
    });

    describe('GET /api/{collectionName}/{resourceId}/{belongToOwner}', function(){
        it('should to get related owner in path', function(done){
            request(app)
                .get('/api/pets/'+ petId + '/owner')
                .end(function (err, res) {
                    if (err) { return done(err); }
                    expect(res.body).to.be.eql({id: personId, name: "I am a person"});
                    expect(res.statusCode).to.be.eql(200);
                    done();
                });
        });
    });
});


describe('hasMany relation', function(){
    var personId;
    var pet1Id, pet2Id, app;

    before(function(done) {
        app = support.newLoopbackJsonSchemaApp();
        var petSchema = {
            'type': 'object',
            'modelName': 'pet',
            'collectionName': 'pets',
            properties: {
                name: {type: 'string'},
                personId: {type: 'number'}
            }
        };
        request(app)
            .post('/api/item-schemas')
            .set('Content-Type', 'application/schema+json')
            .send(JSON.stringify(petSchema))
            .end(function (err, res) {
                if (err) { return done(err); }
                expect(res.statusCode).to.be.eql(201);
                done();
            });
    });

    before(function(done) {
        var personSchema = {
            'type': 'object',
            'modelName': 'person2',
            'collectionName': 'people2',
            properties: {
                name: {type: 'string'}
            },
            relations: {
                pets: {
                    collectionName: 'pets',
                    type: 'hasMany',
                    foreignKey: 'personId'
                }
            }
        };

        request(app)
            .post('/api/item-schemas')
            .set('Content-Type', 'application/schema+json')
            .send(JSON.stringify(personSchema))
            .end(function (err, res) {
                if (err) { return done(err); }
                expect(res.statusCode).to.be.eql(201);
                done();
            });
    });

    before(function(done) {
        var person = {
            name: "I am a person"
        };
        request(app)
            .post('/api/people2')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(person))
            .end(function (err, res) {
                if (err) { return done(err); }
                personId = res.body.id;
                expect(res.statusCode).to.be.eql(201);
                done();
            });
    });

    before(function(done) {
        var pet = {
            name: "my pet 1"
        };
        request(app)
            .post('/api/people2/' + personId + '/pets')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(pet))
            .end(function (err, res) {
                if (err) { return done(err); }
                pet1Id = res.body.id;
                expect(res.statusCode).to.be.eql(200);
                done();
            });
    });

    before(function(done) {
        var pet = {
            name: "my pet 2"
        };
        request(app)
            .post('/api/people2/' + personId + '/pets')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(pet))
            .end(function (err, res) {
                if (err) { return done(err); }
                pet2Id = res.body.id;
                expect(res.statusCode).to.be.eql(200);
                done();
            });
    });

    describe('GET /api/people2/{personId}/pets/{petId}', function(){
        it('should to get related owner in path', function(done){
            request(app)
                .get('/api/people2/'+ personId + '/pets/' + pet1Id)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    expect(res.body).to.be.eql({
                        id: pet1Id,
                        name: "my pet 1",
                        personId: personId
                    });
                    expect(res.statusCode).to.be.eql(200);
                    done();
                });
        });
    });

    describe('GET /api/people2/{personId}/pets', function(){
        it('should to get related pets in path', function(done){
            request(app)
                .get('/api/people2/'+ personId + '/pets')
                .end(function (err, res) {
                    if (err) { return done(err); }
                    expect(res.body).to.be.eql([{
                        id: pet1Id,
                        name: "my pet 1",
                        personId: personId
                    }, {
                        id: pet2Id,
                        name: "my pet 2",
                        personId: personId
                    }]);
                    expect(res.statusCode).to.be.eql(200);
                    done();
                });
        });
    });

    describe('GET /api/{collectionName}/?filter[include]=pets', function(){
        it('should to get related pets in path', function(done){
            request(app)
                .get('/api/people2/?filter[include]=pets')
                .end(function (err, res) {
                    if (err) { return done(err); }
                    expect(res.statusCode).to.be.eql(200);

                    expect(res.body).to.be.eql([{
                        id: personId,
                        name: "I am a person",
                        pets: [
                            {"id": pet1Id, "name": "my pet 1", "personId": 1},
                            {"id": pet2Id, "name": "my pet 2", "personId": 1}
                        ]
                    }]);

                    done();
                });
        });
    });

    describe('GET /api/{collectionName}', function(){
        it('should to get related pets in path', function(done){
            request(app)
                .get('/api/people2')
                .end(function (err, res) {
                    if (err) { return done(err); }
                    expect(res.body).to.be.eql([{
                        id: personId,
                        name: "I am a person"
                    }]);
                    expect(res.statusCode).to.be.eql(200);
                    done();
                });
        });
    });
});

describe('belongsTo reverse relation', function(){
    var personId;
    var petId;
    var app;

    before(function(done) {
        app = support.newLoopbackJsonSchemaApp({ registerItemSchemaAtRequest: false });

        async.series([
            function(callback) {
                var petSchema = {
                    type: 'object',
                    modelName: 'pet3',
                    collectionName: 'pets3',
                    properties: {
                        name: {type: 'string'},
                        personId: {type: 'number'}
                    },
                    relations: {
                        owner: {
                            collectionName: 'people3',
                            type: 'belongsTo',
                            foreignKey: 'personId'
                        }
                    }
                };
                request(app)
                    .post('/api/item-schemas')
                    .set('Content-Type', 'application/schema+json')
                    .send(JSON.stringify(petSchema))
                    .end(function (err, res) {
                        if (err) { return done(err); }
                        expect(res.statusCode).to.be.eql(201);
                        callback(null);
                    });
            },
            function(callback) {
                var personSchema = {
                    'type': 'object',
                    'modelName': 'person3',
                    'collectionName': 'people3',
                    properties: {
                        name: {type: 'string'}
                    }
                };

                request(app)
                    .post('/api/item-schemas')
                    .set('Content-Type', 'application/schema+json')
                    .send(JSON.stringify(personSchema))
                    .end(function (err, res) {
                        if (err) { return done(err); }
                        expect(res.statusCode).to.be.eql(201);
                        callback(null);
                    });
            },
            function(callback) {
                var person = {
                    name: "I am a person"
                };
                request(app)
                    .post('/api/people3')
                    .set('Content-Type', 'application/json')
                    .send(JSON.stringify(person))
                    .end(function (err, res) {
                        if (err) { return done(err); }
                        personId = res.body.id;
                        expect(res.statusCode).to.be.eql(201);
                        callback(null);
                    });
            },
            function(callback) {
                var pet = {
                    name: "my pet",
                    personId: personId
                };
                request(app)
                    .post('/api/pets3')
                    .set('Content-Type', 'application/schema+json')
                    .send(JSON.stringify(pet))
                    .end(function (err, res) {
                        if (err) { return done(err); }
                        petId = res.body.id;
                        expect(res.statusCode).to.be.eql(201);
                        callback(null);
                    });
            },
            function(callback) {
                request(app)
                    .get('/api/pets3/'+ petId + '/owner')
                    .end(function (err, res) {
                        if (err) { return done(err); }
                        expect(res.body).to.be.eql({id: personId, name: "I am a person"});
                        expect(res.statusCode).to.be.eql(200);
                        callback(null);
                    });
            }

        ], function() {
            done();
        });
    });

    describe('GET /api/{collectionName}/{resourceId}/{belongToOwner}', function(){
        it('should to get related owner in path', function(done){
            done();
        });
    });
});


describe('hasMany reverse relation', function(){
    var personId;
    var petId;
    var app;

    before(function(done) {
        app = support.newLoopbackJsonSchemaApp({ registerItemSchemaAtRequest: false });

        async.series([
            function(callback) {
                var petSchema = {
                    type: 'object',
                    modelName: 'pet4',
                    collectionName: 'pets4',
                    properties: {
                        name: {type: 'string'},
                        personId: {type: 'number'}
                    },
                    relations: {
                        owners: {
                            collectionName: 'people4',
                            type: 'hasMany',
                            foreignKey: 'petId'
                        }
                    }
                };
                request(app)
                    .post('/api/item-schemas')
                    .set('Content-Type', 'application/schema+json')
                    .send(JSON.stringify(petSchema))
                    .end(function (err, res) {
                        if (err) { return done(err); }
                        expect(res.statusCode).to.be.eql(201);
                        callback(null);
                    });
            },
            function(callback) {
                var personSchema = {
                    'type': 'object',
                    'modelName': 'person4',
                    'collectionName': 'people4',
                    properties: {
                        name: {type: 'string'}
                    }
                };

                request(app)
                    .post('/api/item-schemas')
                    .set('Content-Type', 'application/schema+json')
                    .send(JSON.stringify(personSchema))
                    .end(function (err, res) {
                        if (err) { return done(err); }
                        expect(res.statusCode).to.be.eql(201);
                        callback(null);
                    });
            },
            function(callback) {
                var pet = {
                    name: "my pet"
                };
                request(app)
                    .post('/api/pets4/')
                    .set('Content-Type', 'application/schema+json')
                    .send(JSON.stringify(pet))
                    .end(function (err, res) {
                        if (err) { return done(err); }
                        petId = res.body.id;
                        expect(res.statusCode).to.be.eql(201);
                        callback(null);
                    });
            },
            function(callback) {
                var person = {
                    name: "I am a person"
                };
                request(app)
                    .post('/api/pets4/'+ petId + '/owners/')
                    .set('Content-Type', 'application/json')
                    .send(JSON.stringify(person))
                    .end(function (err, res) {
                        if (err) { return done(err); }
                        personId = res.body.id;
                        expect(res.statusCode).to.be.eql(200);
                        callback(null);
                    });
            },

            function(callback) {
                request(app)
                    .get('/api/pets4/'+ petId + '/owners')
                    .end(function (err, res) {
                        if (err) { return done(err); }
                        expect(res.body).to.be.eql([{id: personId, name: "I am a person", petId: petId}]);
                        expect(res.statusCode).to.be.eql(200);
                        callback(null);
                    });
            }

        ], function() {
            done();
        });
    });

    describe('GET /api/{collectionName}/{resourceId}/{belongToOwner}', function(){
        it('should to get related owner in path', function(done){
            done();
        });
    });
});
