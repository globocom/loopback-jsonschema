require('../support');

var expect = require('chai').expect;
var loopback = require('loopback');
var request = require('supertest');

var loopbackJsonSchema = require('../../index');
var JsonSchema = require('../../lib/models/json-schema');
var jsonSchemaMiddleware = require('../../lib/middleware/json-schema.middleware');

var app = loopback();
app.set('restApiRoot', '/api');

describe('collection-schema', function() {
    beforeEach(function() {
        loopbackJsonSchema.initLoopbackJsonSchema(app);
    });

    describe('GET /collection-schemas/:schemaId', function () {
       describe('when ItemSchema exists', function () {
            var jsonSchemaId;
            beforeEach(function (done) {
                JsonSchema.create({ modelName: 'person', collectionName: 'people', title: 'Person', type: 'object', properties: {}  }, function(err, jsonSchema) {
                    if (err) { throw err };
                    jsonSchemaId = jsonSchema.id;
                    done();
                });
            });

            it('should return Collection schema', function (done) {
                request(app)
                    .get('/api/collection-schemas/' + jsonSchemaId)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) { throw err };

                        expect(res.body).to.not.be.emtpy;
                        expect(res.body).to.include.keys(['$schema', 'title', 'type', 'properties']);
                        done();
                    });
            });
        });

       describe('when ItemSchema does not exist', function () {
            it('should return 404', function (done) {
                request(app)
                    .get('/api/collection-schemas/invalid-schema-id')
                    .expect(404)
                    .end(function (err, res) {
                        if (err) { throw err };

                        expect(res.body).to.not.be.emtpy;
                        done();
                    });
            });
        });
    });
});