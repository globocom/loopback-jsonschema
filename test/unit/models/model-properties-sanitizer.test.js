require('../../support');

var expect = require('chai').expect;

var JsonSchema = require('../../../lib/models/json-schema');
var modelPropertiesSanitizer = require('../../../lib/models/model-properties-sanitizer');


describe('modelPropertiesSanitizer', function() {
    beforeEach(function() {
        this.jsonSchema = new JsonSchema();
        this.jsonSchema.update$schema();
    });

    describe('.sanitize', function() {
        beforeEach(function() {
            modelPropertiesSanitizer.sanitize(this.jsonSchema);
        });

        it('should convert $schema to %24schema', function() {
            expect(this.jsonSchema.$schema).to.not.exist;
            expect(this.jsonSchema['%24schema']).to.exist;
        });
    });

    describe('.restore', function() {
        beforeEach(function() {
            modelPropertiesSanitizer.sanitize(this.jsonSchema);
            modelPropertiesSanitizer.restore(this.jsonSchema);
        });

        it('should restore %24schema to $schema', function() {
            expect(this.jsonSchema['%24schema']).to.not.exist;
            expect(this.jsonSchema.$schema).to.exist;
        });
    });
});
