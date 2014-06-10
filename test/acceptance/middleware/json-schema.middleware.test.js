var support = require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');
var request = require('supertest');

var app = support.newLoopbackJsonSchemaApp();

describe('json-schema.middleware', function() {
    it('should register a json-schema model', function (done) {
        request(app)
            .post('/api/item-schemas')
            .set('Content-Type', 'application/json')
            .send('{"modelName": "person", "collectionName": "people"}')
            .expect(200)
            .end(function (err, res) {
                var body = JSON.parse(res.text);
                expect(res.headers['link']).to.not.exist;
                expect(body.modelName).to.eq('person');
                expect(body.collectionName).to.eq('people');
                expect(body).to.include.keys('links');
                done();
            });
    });
});