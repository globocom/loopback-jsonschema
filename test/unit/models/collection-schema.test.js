require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var CollectionSchema = require('../../../lib/models/collection-schema');

var app = loopback();

describe('CollectionSchema', function() {
    beforeEach(function() {
        app.set('restApiRoot', '/api');
    });

    describe('#data', function() {
        describe('when ItemSchema is found', function() {
            it('should include type object', function () {

            });

            xit('should include $schema from ItemSchema', function () {

            });

            xit('should use the property "collectionTitle" from ItemSchema as title', function () {
            });

            xit('should include properties', function () {
            });
        });

        describe('when ItemSchema is not found', function() {
            xit('???', function () {
            });
        });
    });
});