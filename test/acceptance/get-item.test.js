var support = require('../support');

var expect = require('chai').expect;
var request = require('supertest');

var ItemSchema = require('../../lib/domain/item-schema');


describe('GET /:collection/:id', function () {
    var itemId, jsonSchemaCollectionName, response, schemeAndAuthority;
    var app;

    before(function() {
        app = support.newLoopbackJsonSchemaApp();
    });
    before(function(done) {
        ItemSchema.create({
            type: 'object',
            title: 'Person',
            collectionTitle: 'People',
            collectionName: 'people',
            properties: {}
        }, function(err, jsonSchema) {
            if (err) { return done(err); }
            jsonSchemaCollectionName = jsonSchema.collectionName;
            done();
        });
    });

    before(function(done) {
        request(app)
            .post('/api/people')
            .set('Content-Type', 'application/json')
            .send('{"name": "Alice"}')
            .expect(201)
            .end(function (err, res) {
                if (err) { return done(err); }
                itemId = res.body.id;
                done();
            });
    });

    before(function(done) {
        request(app)
            .get('/api/people/' + itemId)
            .expect(200)
            .end(function (err, res) {
                if (err) { return done(err); }
                schemeAndAuthority = 'http://' + res.req._headers.host;
                response = res;
                done();
            });
    });

    it('should correlate the item with its schema', function() {
        var itemSchemaUrl = schemeAndAuthority + '/api/item-schemas/' + jsonSchemaCollectionName;
        expect(response.headers['link']).to.eq('<' + itemSchemaUrl + '>; rel="describedby"');
        expect(response.headers['content-type']).to.eq('application/json; charset=utf-8; profile="' + itemSchemaUrl + '"');
    });
});
