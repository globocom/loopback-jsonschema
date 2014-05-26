require('mocha-sinon')();

var chai = require('chai');
var sinonChai = require('sinon-chai');

var ItemSchema = require('../lib/domain/item-schema');

chai.use(sinonChai);

afterEach(function() {
    ItemSchema.deleteAll(function(err) {
        if (err) { throw err };
    });
});
