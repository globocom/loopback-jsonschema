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

describe('GET /:collection', function () {
   describe('when :collection exists', function () {
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

        it('should build schema url with "collection-schemas" collection', function (done) {
            request(app)
                .get('/api/people')
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.not.exist;
                    expect(res.headers['link']).to.exist;
                    expect(res.headers['content-type']).to.match(/^application\/json; charset=utf-8; profile=.*\/api\/collection-schemas\/.*/);
                    done();
                });
        });
    });
});