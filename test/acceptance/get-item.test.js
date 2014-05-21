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

describe('GET /:collection/:id', function () {
    var itemId, jsonSchemaId, response, schemeAndAuthority;

    before(function(done) {
        JsonSchema.create({
            type: 'object',
            title: 'Person',
            collectionTitle: 'People',
            modelName: 'person',
            collectionName: 'people',
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
            .expect(200)
            .end(function (err, res) {
                if (err) { throw err };
                itemId = res.body.id;
                done();
            });
    });

    before(function(done) {
        request(app)
            .get('/api/people/' + itemId)
            .expect(200)
            .end(function (err, res) {
                if (err) { throw err };
                schemeAndAuthority = 'http://' + res.req._headers.host;
                response = res;
                done();
            });
    });

    it('should correlate the item with its schema', function() {
        var itemSchemaUrl = schemeAndAuthority + '/api/json-schemas/' + jsonSchemaId;
        expect(response.headers['link']).to.eq('<' + itemSchemaUrl + '>; rel=describedby');
        expect(response.headers['content-type']).to.eq('application/json; charset=utf-8; profile=' + itemSchemaUrl);
    });
});