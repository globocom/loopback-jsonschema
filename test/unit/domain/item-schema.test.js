require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var CollectionSchema = require('../../../lib/domain/collection-schema');
var ItemSchema = require('../../../lib/domain/item-schema');
var LJSRequest = require('../../../lib/http/ljs-request');

var app = loopback();
app.set('restApiRoot', '/api');

describe('ItemSchema', function() {
    describe('#mergeDefaultCustomLinks', function() {
        beforeEach(function() {
            itemSchema = new ItemSchema({id: 1, collectionName: 'people'});
        });

        describe('when there are no custom links', function() {
            beforeEach(function() {
                itemSchema.mergeDefaultCustomLinks();
            });

            it('should default links with empty custom links', function() {
                expect(itemSchema.links).to.eql([
                    { rel: 'self', href: '/people/{id}' },
                    { rel: 'item', href: '/people/{id}' },
                    {
                        rel: 'create',
                        method: 'POST',
                        href: '/people',
                        schema: {
                            $ref: '/item-schemas/1'
                        }
                    },
                    { rel: 'update', method: 'PUT', href: '/people/{id}' },
                    { rel: 'delete', method: 'DELETE', href: '/people/{id}' }
                ]);
            });
        });

        describe('when there are custom links', function() {
            beforeEach(function() {
                itemSchema.links = [{ rel: 'custom', href: '/custom' }];
                itemSchema.mergeDefaultCustomLinks();
            });

            it('should merge default and custom links', function() {
                expect(itemSchema.links).to.eql([
                    { rel: 'self', href: '/people/{id}' },
                    { rel: 'item', href: '/people/{id}' },
                    {
                        rel: 'create',
                        method: 'POST',
                        href: '/people',
                        schema: {
                            $ref: '/item-schemas/1'
                        }
                    },
                    { rel: 'update', method: 'PUT', href: '/people/{id}' },
                    { rel: 'delete', method: 'DELETE', href: '/people/{id}' },
                    { rel: 'custom', href: '/custom' }
                ]);
            });
        });

        describe('when there are custom links trying to override a default link', function() {
            beforeEach(function() {
                itemSchema.links = [{ rel: 'self', href: '/custom' }];
                itemSchema.mergeDefaultCustomLinks();
            });

            it('should merge default and custom links without overriding default links', function() {
                expect(itemSchema.links).to.eql([
                    { rel: 'self', href: '/people/{id}' },
                    { rel: 'item', href: '/people/{id}' },
                    {
                        rel: 'create',
                        method: 'POST',
                        href: '/people',
                        schema: {
                            $ref: '/item-schemas/1'
                        }
                    },
                    { rel: 'update', method: 'PUT', href: '/people/{id}' },
                    { rel: 'delete', method: 'DELETE', href: '/people/{id}' }
                ]);
            });
        });
    });

    describe('#defaultLinks', function() {
        var itemSchema;

        beforeEach(function() {
            itemSchema = new ItemSchema({id: 1, collectionName: 'people'});
        });

        it('should return default links', function() {
            expect(itemSchema.defaultLinks()).to.eql([
                { rel: 'self', href: '/people/{id}' },
                { rel: 'item', href: '/people/{id}' },
                {
                    rel: 'create',
                    method: 'POST',
                    href: '/people',
                    schema: {
                        $ref: '/item-schemas/1'
                    }
                },
                { rel: 'update', method: 'PUT', href: '/people/{id}' },
                { rel: 'delete', method: 'DELETE', href: '/people/{id}' }
            ]);
        });
    });

    describe('#customLinks', function() {
        beforeEach(function() {
            itemSchema = new ItemSchema({ id: 1, collectionName: 'people' });
        });

        it('should return custom links', function() {
            itemSchema.links = [{ rel: 'custom', href: '/custom' }];
            expect(itemSchema.customLinks()).to.eql([
                { rel: 'custom', href: '/custom' }
            ]);
        });

        it('should not include custom links that try to override default links', function() {
            itemSchema.links = [{ rel: 'self', href: '/custom' }];
            expect(itemSchema.customLinks()).to.eql([]);
        });
    });

    describe('#url', function() {
        var itemSchema;

        beforeEach(function() {
            itemSchema = new ItemSchema({ id: 1 });
        });

        it('should return URL this item schema', function() {
            expect(itemSchema.url()).to.eq('/item-schemas/1');
        });
    });

    describe('#itemUrlTemplate', function() {
        var itemSchema;

        beforeEach(function() {
            itemSchema = new ItemSchema({ collectionName: 'people' });
        });

        it('should return URL template for an item represented by this item schema', function() {
            expect(itemSchema.itemUrlTemplate()).to.eq('/people/{id}');
        });
    });

    describe('#collectionUrl', function() {
        var itemSchema;

        beforeEach(function() {
            itemSchema = new ItemSchema({ collectionName: 'people' });
        });

        it('should return URL for the collection of items represented by this item schema', function() {
            expect(itemSchema.collectionUrl()).to.eq('/people');
        });
    });

    describe('#update$schema', function() {
        it('should set $schema to hyper-schema draft-04 by default', function() {
            var jsonSchema = new ItemSchema();
            jsonSchema.update$schema();
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-04/hyper-schema#');
        });

        it('should allow overriding of $schema', function() {
            var jsonSchema = new ItemSchema({$schema: 'http://json-schema.org/draft-03/hyper-schema#'});
            jsonSchema.update$schema();
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-03/hyper-schema#');
        });
    });

    describe('#registerLoopbackModel', function() {
        var Test;

        beforeEach(function() {
            var jsonSchema = new ItemSchema({modelName: 'test', collectionName: 'testplural'});
            jsonSchema.registerLoopbackModel(app);
            Test = loopback.getModel('test');
        });

        it('should create model defined by this json schema', function() {
            expect(Test).to.exist;
        });

        it("should use collectionName as model's plural", function() {
            expect(Test.pluralModelName).to.equal('testplural');
        });
    });

    describe('#collectionSchema', function() {
        var collectionSchema, schemaId;

        beforeEach(function() {
            schemaId = 1;
            var itemSchema = new ItemSchema({id: schemaId});
            collectionSchema = itemSchema.collectionSchema();
        });

        it('should return a collection schema that corresponds to this item schema', function() {
            expect(collectionSchema).to.be.an.instanceof(CollectionSchema);
            expect(collectionSchema.itemSchema.id).to.eq(schemaId);
        });
    });
});
