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
app.installMiddleware();

describe('json-schema.middleware', function() {
    beforeEach(function() {
        loopbackJsonSchema.init(app);
    });

    it('should register a json-schema', function (done) {
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

    it("should add jsonschema headers", function (done) {
        var fetchAlice = function(registerRes) {
            request(app)
                .get('/api/people/'+ registerRes.body.id)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.not.exist;
                    expect(res.headers['link']).to.exist;
                    expect(res.headers['content-type']).to.match(/^application\/json; charset=utf-8; profile=.*\/api\/json-schemas\/.*/);
                    done();
                });
        };

        var registerPerson = function() {
            request(app)
                .post('/api/people')
                .set('Content-Type', 'application/json')
                .send('{"name": "Alice"}')
                .expect(200)
                .end(function (err, res) {
                    fetchAlice(res);
                });
        };

        request(app)
            .post('/api/json-schemas')
            .set('Content-Type', 'application/json')
            .send('{"modelName": "person", "collectionName": "people", "properties": { "name": { "type": "string", "title": "Name" }}}')
            .expect(200)
            .end(function (err, res) {
                registerPerson();
            });
    });
});