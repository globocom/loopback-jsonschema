require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');
var supertest = require('supertest');

var loopbackJsonSchema = require('../../../index');
var JsonSchema = require('../../../lib/models/json-schema');
var jsonSchemaMiddleware = require('../../../lib/middleware/json-schema.middleware');

var app = loopback();
app.set('restApiRoot', '/api');
app.use(app.get('restApiRoot'), jsonSchemaMiddleware());
app.installMiddleware();

describe('json-schema.middleware', function() {
    beforeEach(function() {
        loopbackJsonSchema.initLoopbackJsonSchema(app);
        var jsonSchema = new JsonSchema({modelName: 'test-car', collectionName: 'test-cars'});
        jsonSchema.createLoopbackModel(app);
        jsonSchema.save(function(err, car) {
          if(car.errors) {
            console.log(car.errors);
          }
        });

        Car = loopback.getModel('test-car');
    });

    it("should add the header 'Link' when accessing an specific resource", function (done) {
        Car.create({name: 'C3', color: 'black'}, function(err, car) {
            supertest(app)
                .get('/api/test-cars/'+ car.id)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.not.exist;
                    expect(res.headers['link']).to.exist;
                    expect(res.headers['content-type']).to.match(/^application\/json; profile='.*\/api\/json-schemas\/.*'/);
                    done();
                });
        });
    });
});