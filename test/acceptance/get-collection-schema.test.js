require('../support');

var expect = require('chai').expect;
var loopback = require('loopback');
var request = require('supertest');

var loopbackJsonSchema = require('../../index');
var JsonSchema = require('../../lib/models/json-schema');
var jsonSchemaMiddleware = require('../../lib/middleware/json-schema.middleware');

var app = loopback();
app.set('restApiRoot', '/api');
app.use(app.get('restApiRoot'), jsonSchemaMiddleware());
loopbackJsonSchema.init(app);
app.installMiddleware();

describe('GET /collection-schemas/:schemaId', function () {
   describe('when item schema exists', function () {
        var jsonSchemaId;

        beforeEach(function (done) {
            JsonSchema.create({
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

        it('should return Collection schema', function (done) {
            request(app)
                .get('/api/collection-schemas/' + jsonSchemaId)
                .expect(200)
                .end(function (err, res) {
                    if (err) { throw err };
                    expect(res.body).to.not.be.empty;
                    expect(res.body).to.include.keys(['$schema', 'title', 'type', 'items', 'links']);
                    done();
            });
        });
    });

   describe('when item schema does not exist', function () {
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