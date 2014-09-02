require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var models = require('../../../lib/domain/models');

describe('models', function() {
    describe('.fromPluralModelName', function() {
        var app = loopback();
        var Model;

        beforeEach(function() {
            var TestModel = { modelName: 'person-test-models', pluralModelName : 'people-test-models' };
            app.models().push(TestModel);
            Model = models.fromPluralModelName(app, 'people-test-models');
        });

        afterEach(function() {
            app.models().splice(0, app.models().length);
        });

        it('should return Model class from plural model name', function() {
            expect(Model.modelName).to.eq('person-test-models');
        });

        it('should be cached', function() {
            expect(models.fromPluralModelName.flush).to.exist;
        });
    });
});
