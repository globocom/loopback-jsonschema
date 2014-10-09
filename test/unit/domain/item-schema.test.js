require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var CollectionSchema = require('../../../lib/domain/collection-schema');
var ItemSchema = require('../../../lib/domain/item-schema');
var LJSRequest = require('../../../lib/http/ljs-request');

var app = loopback();
app.set('restApiRoot', '/api');

describe('ItemSchema', function() {
    var itemSchema;

    it('should isinstance of loopback.Model', function(){
        expect(ItemSchema.prototype).to.be.an.instanceof(loopback.Model);
    });

    describe('#allLinks', function() {
        beforeEach(function() {
            itemSchema = new ItemSchema({resourceId: 1, collectionName: 'people'});
        });

        describe('when there are no custom links', function() {
            it('should default links with empty custom links', function() {
                expect(itemSchema.allLinks()).to.eql([
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
            });

            it('should merge default and custom links', function() {
                expect(itemSchema.allLinks()).to.eql([
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
            });

            it('should merge default and custom links without overriding default links', function() {
                expect(itemSchema.allLinks()).to.eql([
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

    describe('#customLinks', function() {
        beforeEach(function() {
            itemSchema = new ItemSchema({ resourceId: 1, collectionName: 'people' });
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

    describe('#defaultLinks', function() {
        beforeEach(function() {
            itemSchema = new ItemSchema({resourceId: 1, collectionName: 'people'});
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

    describe('#url', function() {
        beforeEach(function() {
            itemSchema = new ItemSchema({ resourceId: 1 });
        });

        it('should return URL this item schema', function() {
            expect(itemSchema.url()).to.eq('/item-schemas/1');
        });
    });

    describe('#itemUrlTemplate', function() {
        beforeEach(function() {
            itemSchema = new ItemSchema({ collectionName: 'people' });
        });

        it('should return URL template for an item represented by this item schema', function() {
            expect(itemSchema.itemUrlTemplate()).to.eq('/people/{id}');
        });
    });

    describe('#collectionUrl', function() {
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

        beforeEach(function(done) {
            itemSchema = new ItemSchema({
                modelName: 'test',
                collectionName: 'testplural',
                properties: {
                    myArray: {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    myBoolean: {
                        type: 'boolean'
                    },
                    myInteger: {
                        type: 'integer'
                    },
                    myNumber: {
                        type: 'number'
                    },
                    myNull: {
                        type: 'null'
                    },
                    myObject: {
                        type: 'object'
                    },
                    myString: {
                        type: 'string'
                    }
                }
            });
            itemSchema.registerLoopbackModel(app, function(err) {
                Test = loopback.getModel('test');
                done(err);
            });
        });

        it('should create model defined by this json schema', function() {
            expect(Test).to.exist;
        });

        it("should use collectionName as model's plural", function() {
            expect(Test.pluralModelName).to.equal('testplural');
        });

        it('should have properties defined by this json schema', function() {
            var rawProperties = Test.definition.rawProperties;
            delete rawProperties.id;
            expect(Test.definition.rawProperties).to.eql({
                myBoolean: {
                    type: 'boolean'
                },
                myInteger: {
                    type: 'number'
                },
                myNumber: {
                    type: 'number'
                },
                myNull: {
                    type: 'null'
                },
                myObject: {
                    type: 'object'
                },
                myString: {
                    type: 'string'
                }
            });
        });

        describe('with a beforeRegisterLoopbackModel hook', function() {
            var customItemSchema;

            beforeEach(function(done) {
                customItemSchema = new CustomItemSchema({modelName: 'test', collectionName: 'testplural'});
                customItemSchema.beforeRegisterLoopbackModelCalled = false;
                customItemSchema.registerLoopbackModel(app, function(err) {
                    done(err);
                });
            });

            it('should call hook immediately before registering model', function(done) {
                expect(customItemSchema.beforeRegisterLoopbackModelCalled).to.be.true;
                done();
            });
        });
    });

    describe('#model', function() {
        beforeEach(function() {
            var Test = loopback.Model.extend('test');
            app.model(Test);
            itemSchema = new ItemSchema({ modelName: 'test' });
        });

        it('should return the model represented by this item schema', function() {
            expect(itemSchema.model()).to.eq(loopback.getModel('test'));
        });
    });

    describe('#collectionSchema', function() {
        var collectionSchema, schemaResourceId;

        beforeEach(function() {
            schemaResourceId = 1;
            itemSchema = new ItemSchema({resourceId: schemaResourceId});
            collectionSchema = itemSchema.collectionSchema();
        });

        it('should return a collection schema that corresponds to this item schema', function() {
            expect(collectionSchema).to.be.an.instanceof(CollectionSchema);
            expect(collectionSchema.itemSchema.resourceId).to.eq(schemaResourceId);
        });
    });

    describe('#createIndexes', function(){
        var dataSource;
        var database;

        describe('datasource with autoupdate method', function(){
            beforeEach(function(){
                itemSchema = new ItemSchema({resourceId: 1, modelName: 'person', collectionName: 'people'});
                var Connector = function (){
                    this.name = 'GLOBODB';
                };

                Connector.prototype.autoupdate = this.sinon.spy();

                database = {
                    connector: new Connector()
                };

                itemSchema.getDataSource = this.sinon.stub().returns(database);
            });

            it('should create indexes', function(done){
                itemSchema.createIndexes(function(err, created) {
                });
                expect(database.connector.autoupdate).to.have.been.calledWith(['person']);
                done();
            });
        });

        describe('datasource without autoupdate method', function(){
            beforeEach(function(){
                itemSchema = new ItemSchema({resourceId: 1, modelName: 'person', collectionName: 'people'});
                var Connector = function (){
                    this.name = 'MEMORY';
                };

                database = {
                    connector: new Connector()
                };
                itemSchema.getDataSource = this.sinon.stub().returns(database);
            });

            it('should not create indexes', function(done){
                itemSchema.createIndexes(function (err, created) {
                    expect(err).to.be.null;
                    expect(created).to.be.false;
                    done();
                });
            });
        });
    });
});

var CustomItemSchema = ItemSchema.extend('custom-item-schema');

CustomItemSchema.prototype.beforeRegisterLoopbackModel = function(app, JsonSchemaModel, callback) {
    this.beforeRegisterLoopbackModelCalled = true;
    callback();
};
