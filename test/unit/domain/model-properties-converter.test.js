require('../../support');

var expect = require('chai').expect;

var ItemSchema = require('../../../lib/domain/item-schema');
var modelPropertiesConverter = require('../../../lib/domain/model-properties-converter');


describe('modelPropertiesConverter', function() {
    describe('converting $schema', function() {
        beforeEach(function() {
            this.jsonSchema = new ItemSchema({
                'collectionName': 'test',
                "indexes": {
                    "file_width_index": {"file.width": 1}
                }
            });

            this.jsonSchemaWithKeys = new ItemSchema({
                'collectionName': 'testKeys',
                "indexes": {
                    "file_width_index": {
                        "keys": {
                            "file.width": 1,
                            "file.height": 1,
                        },
                        "options": {
                            "unique": true
                        }
                    }
                }
            });

            this.jsonSchema.update$schema();
            this.jsonSchema.__data.$schema = this.jsonSchema.$schema; // __data.$schema will be defined when a post is received
        });

        describe('.convert', function() {
            it('should convert only if there is a $schema', function() {
                delete this.jsonSchema.$schema;

                modelPropertiesConverter.convert(this.jsonSchema);

                expect(this.jsonSchema).to.not.have.ownProperty('%24schema');
            });

            it('should convert $schema to %24schema', function() {
                modelPropertiesConverter.convert(this.jsonSchema);

                expect(this.jsonSchema['%24schema']).to.exist;
                expect(this.jsonSchema.__data['%24schema']).to.exist;
                expect(this.jsonSchema.$schema).to.not.exist;
                expect(this.jsonSchema.__data.$schema).to.not.exist;
            });

            it('should convert indexes with dot to %2E', function() {
                modelPropertiesConverter.convert(this.jsonSchema);
                expect(
                    this.jsonSchema['indexes']['file_width_index']['file%2Ewidth']).
                to.exist;
                expect(
                    this.jsonSchema['indexes']['file_width_index']['file.width']).
                to.not.exist;
            });

            it('should convert indexes with dotted keys to %2E', function() {
                modelPropertiesConverter.convert(this.jsonSchemaWithKeys);
                expect(
                    this.jsonSchemaWithKeys['indexes']['file_width_index']['keys']['file%2Ewidth']).
                to.exist;
                expect(
                    this.jsonSchemaWithKeys['indexes']['file_width_index']['keys']['file.width']).
                to.not.exist;
            });

            it('should convert indexes with dotted keys to %2E', function() {
                modelPropertiesConverter.convert(this.jsonSchemaWithKeys);
                expect(
                    this.jsonSchemaWithKeys['indexes']['file_width_index']['keys']['file%2Ewidth']).
                to.exist;
                expect(
                    this.jsonSchemaWithKeys['indexes']['file_width_index']['keys']['file.width']).
                to.not.exist;
            });

            it('should not change options in the indexes definitions while converting dotted keys to %2E', function() {
                expect(
                    this.jsonSchemaWithKeys['indexes']['file_width_index']['options']['unique']).
                to.be.true;
                modelPropertiesConverter.convert(this.jsonSchemaWithKeys);
                expect(
                    this.jsonSchemaWithKeys['indexes']['file_width_index']['options']['unique']).
                to.be.true;
            });
        });

        describe('.restore', function() {
            beforeEach(function() {
                modelPropertiesConverter.convert(this.jsonSchema);
                modelPropertiesConverter.restore(this.jsonSchema);
            });

            it('should restore %24schema to $schema', function() {
                expect(this.jsonSchema.$schema).to.exist;
                expect(this.jsonSchema.__data.$schema).to.exist;
                expect(this.jsonSchema['%24schema']).to.not.exist;
                expect(this.jsonSchema.__data['%24schema']).to.not.exist;
            });

            it('should restore indexes with %2E to dot', function() {
                expect(
                    this.jsonSchema['indexes']['file_width_index']['file%2Ewidth']).
                to.not.exist;
                expect(
                    this.jsonSchema['indexes']['file_width_index']['file.width']).
                to.exist;
            });

            it('should restore indexes with %2E to dot', function() {
                expect(
                    this.jsonSchema['indexes']['file_width_index']['file%2Ewidth']).
                to.not.exist;
                expect(
                    this.jsonSchema['indexes']['file_width_index']['file.width']).
                to.exist;
            });

            it('should restore indexes with %2E\'d keys  to dot', function() {

                expect(
                    this.jsonSchema['indexes']['file_width_index']['file%2Ewidth']).
                to.not.exist;
                expect(
                    this.jsonSchema['indexes']['file_width_index']['file.width']).
                to.exist;
            });
        });
    });
});
