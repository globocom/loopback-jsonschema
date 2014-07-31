require('mocha-sinon')();

var chai = require('chai');
var sinonChai = require('sinon-chai');

var ItemSchema = require('../lib/domain/item-schema');
var loopback = require('loopback');
var loopbackJsonSchema = require('../index');

chai.use(sinonChai);

afterEach(function(done) {
    ItemSchema.deleteAll(function(err) {
        if (err) { return done(err); };
        done();
    });
});

var support = {
    newLoopbackJsonSchemaApp: function() {
        var app = loopback();
        app.set('restApiRoot', '/api');
        loopbackJsonSchema.init(app);
        app.use(app.get('restApiRoot'), loopback.rest());
        app.use(loopback.errorHandler());
        return app;
    }
};

module.exports = support;