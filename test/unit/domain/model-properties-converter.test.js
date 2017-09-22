require('../../support');

var expect = require('chai').expect;

var ItemSchema = require('../../../lib/domain/item-schema');
var modelPropertiesConverter = require('../../../lib/domain/model-properties-converter');


describe('modelPropertiesConverter', function() {
    function findLink(links, rel) {
        return links.find(function (link) {
            return link.rel === rel;
        });
    }
    describe('converting $schema', function() {
        beforeEach(function() {
            this.jsonSchema = new ItemSchema({
                collectionName: 'test',
                indexes: {
                    'file_width_index': {'file.width': 1}
                },
                collectionLinks: [
                    {
                        rel: 'search',
                        href: '/search',
                        schema: {
                            properties: {
                                'dot.value': {
                                    type: 'object'
                                }
                            }
                        }
                    },
                    {
                        rel: 'item',
                        href: '/bar'
                    }
                ],
                links: [
                    {
                        rel: 'publish',
                        href: '/publish',
                        schema: {
                            properties: {
                                'dot.value': {
                                    type: 'object'
                                }
                            }
                        }
                    },
                    {
                        rel: 'item',
                        href: '/bar'
                    }
                ],
                versionIndexes: {
                    'file_width_index': {'file.width': 1}
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
                },
                "versionIndexes": {
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
                var parentNode = this.jsonSchema.indexes['file_width_index'];
                expect(parentNode['file%2Ewidth']).to.exist;
                expect(parentNode['file.width']).to.not.exist;
            });

            it('should convert indexes with dotted keys to %2E', function() {
                modelPropertiesConverter.convert(this.jsonSchemaWithKeys);
                var keys = this.jsonSchemaWithKeys.indexes['file_width_index'].keys;
                expect(keys['file%2Ewidth']).to.exist;
                expect(keys['file.width']).to.not.exist;
            });

            it('should convert indexes with dotted keys to %2E', function() {
                modelPropertiesConverter.convert(this.jsonSchemaWithKeys);
                var keys = this.jsonSchemaWithKeys.indexes['file_width_index'].keys;
                expect(keys['file%2Ewidth']).to.exist;
                expect(keys['file.width']).to.not.exist;
            });

            it('should convert versionIndexes with dot to %2E', function() {
                modelPropertiesConverter.convert(this.jsonSchema);
                var parentNode = this.jsonSchema.versionIndexes['file_width_index'];
                expect(parentNode['file%2Ewidth']).to.exist;
                expect(parentNode['file.width']).to.not.exist;
            });

            it('should convert versionIndexes with dotted keys to %2E', function() {
                modelPropertiesConverter.convert(this.jsonSchemaWithKeys);
                var keys = this.jsonSchemaWithKeys.versionIndexes['file_width_index'].keys;
                expect(keys['file%2Ewidth']).to.exist;
                expect(keys['file.width']).to.not.exist;
            });

            it('should convert versionIndexes with dotted keys to %2E', function() {
                modelPropertiesConverter.convert(this.jsonSchemaWithKeys);
                var keys = this.jsonSchemaWithKeys.versionIndexes['file_width_index'].keys;
                expect(keys['file%2Ewidth']).to.exist;
                expect(keys['file.width']).to.not.exist;
            });

            it('should convert collectionLinks schema with dotted keys to %2E', function() {
                modelPropertiesConverter.convert(this.jsonSchema);
                var link = findLink(this.jsonSchema.collectionLinks, 'search');
                var props = link.schema.properties;
                expect(props['dot%2Evalue']).to.exist;
                expect(props['dot.value']).to.not.exist;
            });

            it('should convert links schema with dotted keys to %2E', function() {
                modelPropertiesConverter.convert(this.jsonSchema);
                var link = findLink(this.jsonSchema.links, 'publish');
                var props = link.schema.properties;
                expect(props['dot%2Evalue']).to.exist;
                expect(props['dot.value']).to.not.exist;
            });

            it('should not change options in the indexes definitions while converting dotted keys to %2E', function() {
                var options = this.jsonSchemaWithKeys['indexes']['file_width_index']['options'];
                expect(options.unique).to.be.true;
                modelPropertiesConverter.convert(this.jsonSchemaWithKeys);
                expect(options.unique).to.be.true;
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
                var opts =  this.jsonSchema['indexes']['file_width_index'];
                expect(opts['file%2Ewidth']).to.not.exist;
                expect(opts['file.width']).to.exist;
            });

            it('should restore indexes with %2E to dot', function() {
                var opts = this.jsonSchema['indexes']['file_width_index'];
                expect(opts['file%2Ewidth']).to.not.exist;
                expect(opts['file.width']).to.exist;
            });

            it('should restore indexes with %2E\'d keys  to dot', function() {
                var opts = this.jsonSchema['indexes']['file_width_index'];
                expect(opts['file%2Ewidth']).to.not.exist;
                expect(opts['file.width']).to.exist;
            });

             it('should restore versionIndexes with %2E to dot', function() {
                var opts =  this.jsonSchema['versionIndexes']['file_width_index'];
                expect(opts['file%2Ewidth']).to.not.exist;
                expect(opts['file.width']).to.exist;
            });

            it('should restore versionIndexes with %2E to dot', function() {
                var opts = this.jsonSchema['versionIndexes']['file_width_index'];
                expect(opts['file%2Ewidth']).to.not.exist;
                expect(opts['file.width']).to.exist;
            });

            it('should restore versionIndexes with %2E\'d keys  to dot', function() {
                var opts = this.jsonSchema['versionIndexes']['file_width_index'];
                expect(opts['file%2Ewidth']).to.not.exist;
                expect(opts['file.width']).to.exist;
            });

            it('should restore collectionLinks schema', function() {
                var link = findLink(this.jsonSchema.collectionLinks, 'search');
                var props = link.schema.properties;
                expect(props['dot%2Evalue']).to.not.exist;
                expect(props['dot.value']).to.exist;
            });

            it('should restore links schema', function() {
                var link = findLink(this.jsonSchema.links, 'publish');
                var props = link.schema.properties;
                expect(props['dot%2Evalue']).to.not.exist;
                expect(props['dot.value']).to.exist;
            });
        });
    });
});
