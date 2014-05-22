require('../support');

var expect = require('chai').expect;
var loopback = require('loopback');
var request = require('supertest');

var loopbackJsonSchema = require('../../index');
var ItemSchema = require('../../lib/models/item-schema');
var jsonSchemaMiddleware = require('../../lib/middleware/json-schema.middleware');

var app = loopback();
app.set('restApiRoot', '/api');
app.use(app.get('restApiRoot'), jsonSchemaMiddleware());
loopbackJsonSchema.init(app);
app.installMiddleware();

describe('POST /:collection', function() {
    var itemResponse, jsonSchemaId, schemeAndAuthority;

    before(function (done) {
        ItemSchema.create({
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
            .post('/api/people')
            .set('Content-Type', 'application/json')
            .send('{"name": "Alice"}')
            .expect(200)
            .end(function (err, res) {
                if (err) { throw err };
                schemeAndAuthority = 'http://' + res.req._headers.host;
                itemResponse = res;
                done();
            });
    });

    it('should correlate the item with its schema', function() {
        var itemSchemaUrl = schemeAndAuthority + '/api/item-schemas/' + jsonSchemaId;
        expect(itemResponse.headers['link']).to.eq('<' + itemSchemaUrl + '>; rel=describedby');
        expect(itemResponse.headers['content-type']).to.eq('application/json; charset=utf-8; profile=' + itemSchemaUrl);
    });
});