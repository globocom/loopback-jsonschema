require('../support');

var expect = require('chai').expect;
var loopback = require('loopback');
var request = require('supertest');

var app = loopback();
app.set('restApiRoot', '/api');
app.installMiddleware();

describe('OPTION /collection-schemas/:id', function() {
    var response;

    before(function(done) {
        request(app)
            .options('/api/collection-schemas/1')
            .set('Access-Control-Request-Headers', 'Content-Type')
            .expect(204)
            .end(function (err, res) {
                if (err) { throw err };
                response = res;
                done();
        });
    });

    it('should include CORS headers', function() {
        expect(response.headers['access-control-allow-origin']).to.eq('*');
        expect(response.headers['access-control-allow-methods']).to.eq('GET,HEAD,PUT,PATCH,POST,DELETE');
        expect(response.headers['access-control-allow-headers']).to.eq('Content-Type');
    });
});
