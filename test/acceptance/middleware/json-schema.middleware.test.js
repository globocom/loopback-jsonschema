require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');
var request = require('supertest');

var loopbackJsonSchema = require('../../../index');
var JsonSchema = require('../../../lib/models/json-schema');
var jsonSchemaMiddleware = require('../../../lib/middleware/json-schema.middleware');

var app = loopback();
app.set('restApiRoot', '/api');
app.use(app.get('restApiRoot'), jsonSchemaMiddleware());
loopbackJsonSchema.init(app);
app.installMiddleware();

describe('json-schema.middleware', function() {
    it('should register a json-schema model', function (done) {
        request(app)
            .post('/api/json-schemas')
            .set('Content-Type', 'application/json')
            .send('{"modelName": "person", "collectionName": "people"}')
            .expect(200)
            .end(function (err, res) {
                expect(res.headers['link']).to.not.exist;
                expect(res.body.modelName).to.eq('person');
                expect(res.body.collectionName).to.eq('people');
                expect(res.body).to.include.keys('links');
                done();
            });
    });
});