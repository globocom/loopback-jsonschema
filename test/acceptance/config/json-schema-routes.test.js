require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');
var request = require('supertest');

var loopbackJsonSchema = require('../../../index');
var JsonSchema = require('../../../lib/models/json-schema');
var jsonSchemaMiddleware = require('../../../lib/middleware/json-schema.middleware');

var app = loopback();
app.set('restApiRoot', '/api');

describe('json-schema-routes', function() {
    beforeEach(function() {
        loopbackJsonSchema.initLoopbackJsonSchema(app);
    });

    it('GET /collection-schemas/:schema_id should return Collection schema', function (done) {
        request(app)
            .get('/api/collection-schemas/my-schema-id')
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.not.be.emtpy;
                expect(res.body).to.include.keys(['$schema', 'title', 'type', 'properties']);
                done();
            });
    });
});