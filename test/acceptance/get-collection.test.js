var support = require('../support');

var expect = require('chai').expect;
var loopback = require('loopback');
var request = require('supertest');

var ItemSchema = require('../../lib/domain/item-schema');

var app = support.newLoopbackJsonSchemaApp();

describe('GET /:collection', function () {
    describe('when the collection exists', function() {
        var jsonSchemaResourceId, response, schemeAndAuthority;

        before(function (done) {
            ItemSchema.create({
                modelName: 'person',
                collectionName: 'people',
                title: 'Person',
                collectionTitle: 'People',
                type: 'object',
                properties: {}
            }, function(err, jsonSchema) {
                if (err) { return done(err); };
                jsonSchemaResourceId = jsonSchema.resourceId;
                done();
            });
        });

        before(function(done) {
            request(app)
                .get('/api/people')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); };
                    schemeAndAuthority = 'http://' + res.req._headers.host;
                    response = res;
                    done();
            });
        });

        it('should correlate the collection with its schema', function() {
            var collectionSchemaUrl = schemeAndAuthority + '/api/collection-schemas/' + jsonSchemaResourceId;
            expect(response.headers['link']).to.eq('<' + collectionSchemaUrl + '>; rel=describedby');
            expect(response.headers['content-type']).to.eq('application/json; charset=utf-8; profile="' + collectionSchemaUrl +'"');
        });
    });

    describe('when the collection does not exist', function() {
        it('should return 404', function(done) {
            request(app)
                .get('/api/non-existent')
                .expect(404)
                .end(function (err, res) {
                    if (err) { return done(err); };
                    done();
            });
        });
    });
});
