require('../support');

var expect = require('chai').expect;
var loopback = require('loopback');
var request = require('supertest');

var app = loopback();
app.set('restApiRoot', '/api');
loopbackJsonSchema.init(app);
app.installMiddleware();

describe('POST /item-schemas', function() {
    var response;

    describe('successfully', function() {
        before(function(done) {
            var schemaJson = {
                'type': 'object',
                'modelName': 'person',
                'collectionName': 'people'
            };
            request(app)
                .post('/api/item-schemas')
                .set('Content-Type', 'application/schema+json')
                .send(JSON.stringify(schemaJson))
                .end(function (err, res) {
                    if (err) { throw err };
                    response = res;
                    done();
                });
        });

        it('should return 200', function() {
            expect(response.status).to.eq(200);
        });
    });

    describe('with unsupported Content-Type', function() {
        before(function(done) {
            var schemaJson = {
                'type': 'object',
                'modelName': 'person',
                'collectionName': 'people'
            };
            request(app)
                .post('/api/item-schemas')
                .set('Content-Type', 'text/plain')
                .send(JSON.stringify(schemaJson))
                .end(function (err, res) {
                    if (err) { throw err };
                    response = res;
                    done();
                });
        });

        it('should return 400', function() {
            expect(response.status).to.eq(400);
        });

        it('should return error message', function() {
            expect(response.text).to.eq('Unsupported Content-Type: <text/plain>.')
        });
    });
});
