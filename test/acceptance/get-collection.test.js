require('../support');

var expect = require('chai').expect;
var loopback = require('loopback');
var request = require('supertest');

var loopbackJsonSchema = require('../../index');
var JsonSchema = require('../../lib/models/item-schema');
var jsonSchemaMiddleware = require('../../lib/middleware/json-schema.middleware');

var app = loopback();
app.set('restApiRoot', '/api');
app.use(app.get('restApiRoot'), jsonSchemaMiddleware());
loopbackJsonSchema.init(app);
app.installMiddleware();

describe('GET /:collection', function () {
    var jsonSchemaId, response, schemeAndAuthority;

    before(function (done) {
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

    before(function(done) {
        request(app)
            .get('/api/people')
            .expect(200)
            .end(function (err, res) {
                if (err) { throw err };
                schemeAndAuthority = 'http://' + res.req._headers.host;
                response = res;
                done();
        });
    });

    it('should correlate the collection with its schema', function() {
        var collectionSchemaUrl = schemeAndAuthority + '/api/collection-schemas/' + jsonSchemaId;
        expect(response.headers['link']).to.eq('<' + collectionSchemaUrl + '>; rel=describedby');
        expect(response.headers['content-type']).to.eq('application/json; charset=utf-8; profile=' + collectionSchemaUrl);
    });
});