require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var CollectionSchema = require('../../../lib/domain/collection-schema');
var config = require('../../../lib/support/config');
var ItemSchema = require('../../../lib/domain/item-schema');

var app = loopback();
app.set('restApiRoot', '/api');

describe('ItemSchema', function() {
    var itemSchema;

    it('should be an instance of loopback.PersistedModel', function(){
        expect(ItemSchema.prototype).to.be.an.instanceof(loopback.PersistedModel);
    });

    describe('#allLinks', function() {
        beforeEach(function() {
            itemSchema = new ItemSchema({collectionName: 'people'});
        });

        describe('when there are no custom links', function() {
            it('should return only default links', function() {
                expect(itemSchema.allLinks()).to.eql([
                    { rel: 'self', href: '/people/{id}' },
                    { rel: 'item', href: '/people/{id}' },
                    {
                        rel: 'create',
                        method: 'POST',
                        href: '/people',
                        schema: {
                            $ref: '/item-schemas/people'
                        }
                    },
                    { rel: 'update', method: 'PUT', href: '/people/{id}' },
                    { rel: 'delete', method: 'DELETE', href: '/people/{id}' },
                    { rel: 'parent', href: '/people' }
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
                            $ref: '/item-schemas/people'
                        }
                    },
                    { rel: 'update', method: 'PUT', href: '/people/{id}' },
                    { rel: 'delete', method: 'DELETE', href: '/people/{id}' },
                    { rel: 'parent', href: '/people' },
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
                            $ref: '/item-schemas/people'
                        }
                    },
                    { rel: 'update', method: 'PUT', href: '/people/{id}' },
                    { rel: 'delete', method: 'DELETE', href: '/people/{id}' },
                    { rel: 'parent', href: '/people' }
                ]);
            });
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

    describe('#defaultLinks', function() {
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
                        $ref: '/item-schemas/people'
                    }
                },
                { rel: 'update', method: 'PUT', href: '/people/{id}' },
                { rel: 'delete', method: 'DELETE', href: '/people/{id}' },
                { rel: 'parent', href: '/people' }
            ]);
        });
    });

    describe('#relationLinks', function(){
        var relationLinks;

        beforeEach(function() {
            itemSchema = new ItemSchema({
                id: 1,
                collectionName: 'people',
                relations: {
                    work: {
                        collectionName: 'works',
                        type: 'belongsTo',
                        foreignKey: 'workId'
                    },
                    friends: {
                        collectionName: 'friends',
                        type: 'hasMany',
                        foreignKey: 'friendId'
                    }
                }
            });

            relationLinks = itemSchema.relationLinks();
        });

        it('should to return a related relation links', function(){
            expect(relationLinks).to.be.eql([
                { rel: 'work', href: '/works/{workId}' },
                { rel: 'friends', href: '/people/{id}/friends' },
            ]);
        });
    });

    describe('#url', function() {
        beforeEach(function() {
            itemSchema = new ItemSchema({ collectionName: 'test' });
        });

        it('should return URL this item schema', function() {
            expect(itemSchema.url()).to.eq('/item-schemas/test');
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

    describe('#registerRemoteHookInitializers', function(){
        var noopHook;

        beforeEach(function() {
            noopHook = function noopHook() {};
            this.sinon.stub(ItemSchema, 'remoteHookInitializers').value([noopHook]);
        });

        describe('when hooks is an Array of functions', function(){
            var hook1 = function() {};
            var hook2 = function() {};

            beforeEach(function() {
                ItemSchema.registerRemoteHookInitializers([hook1, hook2]);
            });

            it('should to insert each hook', function(){
                expect(ItemSchema.remoteHookInitializers).to.be.eql([
                    noopHook,
                    hook1,
                    hook2
                ]);
            });
        });

        describe('when hooks is a function', function(){
            var hook = function() {};

            beforeEach(function() {
                ItemSchema.registerRemoteHookInitializers(hook);
            });

            it('should to insert the hook', function(){
                expect(ItemSchema.remoteHookInitializers).to.be.eql([
                    noopHook,
                    hook,
                ]);
            });
        });
    });

    describe('#registerModel', function() {
        var Test;

        beforeEach(function(done) {
            itemSchema = new ItemSchema({
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
                    },
                    myRequired: {
                        type: 'string',
                        required: true
                    },
                    myArrayType: {
                        type: ['string', 'object']
                    }
                }
            });

            Test = itemSchema.constructModel();
            itemSchema.registerModel(Test, function(err) {
                done(err);
            });
        });

        it('should define the cachedItemSchema property', function(){
            expect(Test.cachedItemSchema).to.be.instanceOf(ItemSchema);
        });

        it('should create model defined by this json schema', function() {
            expect(Test).to.exist;
        });

        it('should use collectionName as model\'s plural', function() {
            expect(Test.pluralModelName).to.equal('testplural');
        });

        it('should have properties defined by this json schema', function() {
            expect(Test.definition.rawProperties).to.eql({
                id: {
                    generated: true,
                    id: 1,
                    type: Number
                },
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
                },
                myRequired: {
                    type: 'string'
                }
            });
        });

        it('should remove \'required\' attributes from model definition', function() {
            expect(Test.definition.rawProperties.myRequired.required).to.be.undefined;
        });

        describe('with a beforeRegisterLoopbackModel hook', function() {
            var customItemSchema;

            beforeEach(function(done) {
                customItemSchema = new CustomItemSchema({collectionName: 'testplural'});
                customItemSchema.beforeRegisterLoopbackModelCalled = false;
                var model = customItemSchema.constructModel();
                customItemSchema.registerModel(model, function(err) {
                    done(err);
                });
            });

            it('should call hook immediately before registering model', function(done) {
                expect(customItemSchema.beforeRegisterLoopbackModelCalled).to.be.true;
                done();
            });
        });

        describe('with config.generatedId = false', function() {
            beforeEach(function(done) {
                config.generatedId = false;
                Test = itemSchema.constructModel();
                itemSchema.registerModel(Test, function(err) {
                    done(err);
                });
            });

            afterEach(function() {
                config.generatedId = true;
            });

            it('should have id property as type string and generated false', function() {
                expect(Test.definition.rawProperties.id).to.eql({
                    generated: false,
                    id: true,
                    type: 'string'
                });
            });
        });
    });

    describe('#model', function() {
        describe('when ItemSchema not is registred', function(){
            var unregistredModelSchema;

            before(function() {
                unregistredModelSchema = new ItemSchema({collectionName: 'unregistred-model'});
            });

            it('should return null', function(){
                expect(unregistredModelSchema.model()).to.be.null;
            });
        });

        describe('when ItemSchema is registred', function(){
            var registredModelSchema;
            var model;

            before(function(done) {
                registredModelSchema = new ItemSchema({collectionName: 'registred-model'});
                var contructedModel = registredModelSchema.constructModel();
                registredModelSchema.registerModel(contructedModel, function(err) {
                    if (err) { return done(err); }
                    model = registredModelSchema.model();
                    done();
                });
            });

            it('should return a model instance', function() {
                expect(model.prototype).to.be.an.instanceof(loopback.PersistedModel);
            });

            it('should return the model represented by this item schema', function() {
                expect(model).to.eq(loopback.getModel('registred-model'));
            });
        });
    });

    describe('#collectionSchema', function() {
        var collectionSchema, schemaId;

        beforeEach(function() {
            itemSchema = new ItemSchema({collectionName: 'test'});
            collectionSchema = itemSchema.collectionSchema();
        });

        it('should return a collection schema that corresponds to this item schema', function() {
            expect(collectionSchema).to.be.an.instanceof(CollectionSchema);
            expect(collectionSchema.itemSchema.collectionName).to.eq('test');
        });
    });

    describe('#createIndexes', function(){
        var database;

        describe('datasource with autoupdate method', function(){
            beforeEach(function(){
                itemSchema = new ItemSchema({collectionName: 'people'});
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
                itemSchema.createIndexes(function() {});
                expect(database.connector.autoupdate).to.have.been.calledWith(['people']);
                done();
            });
        });

        describe('datasource without autoupdate method', function(){
            beforeEach(function(){
                itemSchema = new ItemSchema({collectionName: 'people'});
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

    describe('#preLoadModels', function(){
        var attachModelStub, itemSchemaFindStub;
        var model1, model2;
        var itemSchemaRegisterModel1Called, itemSchemaRegisterModel2Called;
        var itemSchemaConstructModelStub1, itemSchemaConstructModelStub2;

        describe('when database was a successfully reply', function(){
            beforeEach(function(done) {
                ItemSchema.app = loopback();
                var schema1 = new ItemSchema({collectionName: 'PreLoadedModel1'});
                var schema2 = new ItemSchema({collectionName: 'PreLoadedModel2'});

                var Model = function () {};
                model1 = new Model();
                model2 = new Model();

                itemSchemaFindStub = this.sinon.stub(ItemSchema, 'find').yields(null, [schema1, schema2]);

                itemSchemaConstructModelStub1 = this.sinon.stub(schema1, 'constructModel').returns(model1);
                itemSchemaConstructModelStub2 = this.sinon.stub(schema2, 'constructModel').returns(model2);

                attachModelStub = this.sinon.stub(ItemSchema, 'attachModel').returns(null);

                itemSchemaRegisterModel1Called = false;
                this.sinon.stub(schema1, 'registerModel', function(model, callback) {
                    itemSchemaRegisterModel1Called = true;
                });

                itemSchemaRegisterModel2Called = false;
                this.sinon.stub(schema2, 'registerModel', function(model, callback) {
                    itemSchemaRegisterModel2Called = true;
                });

                ItemSchema.preLoadModels();

                ItemSchema.app.once('loadModels', function() {
                    done();
                });
            });

            after(function () {
                itemSchemaFindStub.restore();
            });

            it('calls ItemSchema.find', function(){
                expect(itemSchemaFindStub).to.have.been.calledWith({});
            });

            it('sets ItemSchema.preLoadModels to true', function(){
                expect(ItemSchema.preLoadedModels).to.be.true;
            });

            it('calls itemSchema.constructModel', function(){
                expect(itemSchemaConstructModelStub1).to.have.been.called;
                expect(itemSchemaConstructModelStub2).to.have.been.called;
            });

            it('calls ItemSchema.attachModel', function(){
                expect(attachModelStub).to.have.been.calledWith(model1);
                expect(attachModelStub).to.have.been.calledWith(model2);
            });

            it('calls itemSchema.registerModel', function(){
                expect(itemSchemaRegisterModel1Called).to.be.true;
                expect(itemSchemaRegisterModel2Called).to.be.true;
            });
        });

        describe('when database failed', function(){
            var receivedErr;
            before(function(done) {
                itemSchemaFindStub = this.sinon.stub(ItemSchema, 'find').yields(new Error('foo error'));

                ItemSchema.preLoadModels();

                ItemSchema.app.once('loadModels', function(err) {
                    receivedErr = err;
                    done();
                });
            });

            after(function() {
                itemSchemaFindStub.restore();
            });

            it('call ItemSchema.find 6 times', function(){
                expect(itemSchemaFindStub.callCount).to.eql(6);
            });

            it('receive a error in the last attempt', function(){
                expect(receivedErr).not.be.null;
                expect(receivedErr).not.be.undefined;
            });
        });
    });

    describe('#sanitizeForDatabase', function() {
        var itemSchema;
        var schema = {
            collectionName: 'people',
            relations: {
                things: {
                    collectionName: "things",
                    type: "belongsTo",
                    foreignKey: "peopleId"
                }
            }
        };

        describe('when no $schema is defined', function() {
            beforeEach(function() {
                itemSchema = ItemSchema(schema);
                itemSchema.sanitizeForDatabase();
            });

            it('should use draft-04 on it', function() {
                expect(itemSchema['%24schema']).to.eql('http://json-schema.org/draft-04/hyper-schema#');
            });
        });

        describe('when $schema is defined', function() {
            beforeEach(function() {
                schema['$schema'] = 'http://json-schema.org/draft-03/hyper-schema#';

                itemSchema = ItemSchema(schema);
                itemSchema.sanitizeForDatabase();
            });

            it('should use what was defined on it', function() {
                expect(itemSchema['%24schema']).to.eql('http://json-schema.org/draft-03/hyper-schema#');
            });
        });

        describe('when dealing with links', function() {
            beforeEach(function() {
                itemSchema = ItemSchema(schema);
            });

            it('should include custom links', function() {
                itemSchema.links = [{ rel: 'custom', href: '/custom' }];
                itemSchema.sanitizeForDatabase();

                expect(itemSchema.links).to.eql([
                    { rel: 'custom', href: '/custom' }
                ]);
            });

            it('should not include custom links that try to override default links', function() {
                itemSchema.links = [{ rel: 'self', href: '/custom' }];
                itemSchema.sanitizeForDatabase();

                expect(itemSchema.links).to.eql([]);
            });
        });

        describe('when sanitizing', function() {
            beforeEach(function() {
                schema['$schema'] = 'http://json-schema.org/draft-03/hyper-schema#';
                schema.indexes = {
                    "file_width_index": {
                        "keys": {
                            "file.width": 1,
                            "file.height": 1,
                        },
                        "options": {
                            "unique": true
                        }
                    }
                };
                schema.collectionLinks = [{
                    rel: 'custom',
                    href: '/custom',
                    schema: {
                        properties: {
                            'dot.value': {
                                type: 'object'
                            }
                        }
                    }
                }];
                schema.links = [{
                    rel: 'custom',
                    href: '/custom',
                    schema: {
                        properties: {
                            'dot.value': {
                                type: 'object'
                            }
                        }
                    }
                }];
                itemSchema = ItemSchema(schema);
                itemSchema.sanitizeForDatabase();
            });

            it('should convert indexes', function() {
                expect(itemSchema.indexes.file_width_index.keys).to.eql({ 'file%2Ewidth': 1, 'file%2Eheight': 1 });
            });

            it('should convert $schema', function() {
                expect(itemSchema).to.have.property('%24schema');
            });

            it('should convert collectionLinks', function() {
                expect(itemSchema.links[0].schema.properties).to.eql({'dot%2Evalue': {type: 'object'}});
            });

            it('should convert links', function() {
                expect(itemSchema.collectionLinks[0].schema.properties).to.eql({'dot%2Evalue': {type: 'object'}});
            });
        });
    });

    describe('.validate(\'relations\')', function(){

        var itemSchemaIsValid;

        describe('when the property relations is valid', function(){
            beforeEach(function(done) {
                var schema = {
                    collectionName: 'people',
                    relations: {
                        things: {
                            collectionName: "things",
                            type: "belongsTo",
                            foreignKey: "peopleId"
                        }
                    }
                };
                var itemSchema = ItemSchema(schema);
                itemSchema.isValid(function(isValid) {
                    itemSchemaIsValid = isValid;
                    done();
                });
            });

            it('should pass without an error', function(){
                expect(itemSchemaIsValid).to.be.true;
            });
        });

        describe('when the property relations is invalid', function(){
            beforeEach(function(done) {
                var wrongSchema = {
                    collectionName: 'people',
                    relations: {
                        things: {
                            collectionName: "things",
                            type: "belongsToMe",
                            foreignWrong: "peopleId",
                            blah: "haha"
                        }
                    }
                };
                var itemSchema = new ItemSchema(wrongSchema);

                itemSchema.isValid(function(isValid) {
                    var itemSchemaIsValid = isValid;
                    done();
                });
            });

            it('should ignore with an error', function(){
                expect(itemSchemaIsValid).to.be.falsy;
            });
        });
    });
});

var CustomItemSchema = ItemSchema.extend('custom-item-schema');

CustomItemSchema.prototype.beforeRegisterLoopbackModel = function(app, JsonSchemaModel, callback) {
    this.beforeRegisterLoopbackModelCalled = true;
    callback();
};
