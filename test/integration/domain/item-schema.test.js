var support = require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var logger = require('../../../lib/support/logger')
var ItemSchema = require('../../../lib/domain/item-schema');
var LJSRequest = require('../../../lib/http/ljs-request');

var app = support.newLoopbackJsonSchemaApp();

describe('ItemSchema', function() {
    describe('.findOne', function() {
        beforeEach(function(done) {
            ItemSchema.create({collectionName: 'test'}, function(err, instance) {
                if (err) { return done(err); };
                done();
            });
        });

        it('should have $schema', function(done) {
            ItemSchema.findOne({where: {collectionName: 'test'}}, function(err, itemSchema) {
                if (err) { return done(err); };
                expect(itemSchema.$schema).to.exist;
                done();
            });
        });
    });

    describe('.create', function() {
        it('should set $schema', function(done) {
            ItemSchema.create({collectionName: 'test'}, function(err, itemSchema) {
                if (err) { return done(err); };
                expect(itemSchema.$schema).to.exist;
                done();
            });
        });

        it('should create model defined by the json schema provided', function(done) {
            ItemSchema.create({collectionName: 'test'}, function(err) {
                if (err) { return done(err); }
                expect(loopback.getModel('test')).to.exist;
                done();
            });
        });

        it('should save custom links', function(done) {
            var customLinks = [{ rel: 'custom', href: '/custom' }];
            ItemSchema.create({collectionName: 'people', links: customLinks}, function(err, itemSchema) {
                if (err) { return done(err); }
                expect(itemSchema.links).to.eql([
                    { rel: 'self', href: '/people/{id}' },
                    { rel: 'item', href: '/people/{id}' },
                    {
                        rel: 'create',
                        method: 'POST',
                        href: '/people',
                        schema: {
                            $ref: '/item-schemas/' + itemSchema.collectionName
                        }
                    },
                    { rel: 'update', method: 'PUT', href: '/people/{id}' },
                    { rel: 'delete', method: 'DELETE', href: '/people/{id}' },
                    { rel: 'parent', href: '/people' },
                    { rel: 'custom', href: '/custom' }
                ]);
                done();
            });
        });

        it('should not allow overriding default links', function(done) {
            var customLinks = [{ rel: 'self', href: '/custom' }];
            ItemSchema.create({collectionName: 'people', links: customLinks}, function(err, itemSchema) {
                if (err) { return done(err); }
                expect(itemSchema.links).to.eql([
                    { rel: 'self', href: '/people/{id}' },
                    { rel: 'item', href: '/people/{id}' },
                    {
                        rel: 'create',
                        method: 'POST',
                        href: '/people',
                        schema: {
                            $ref: '/item-schemas/' + itemSchema.collectionName
                        }
                    },
                    { rel: 'update', method: 'PUT', href: '/people/{id}' },
                    { rel: 'delete', method: 'DELETE', href: '/people/{id}' },
                    { rel: 'parent', href: '/people' }
                ]);
                done();
            });
        });

        it('should persist only custom links', function(done) {
            var customLinks = [{ rel: 'self', href: '/people/{id}' }, { rel: 'custom', href: '/custom' }];

            ItemSchema.create({collectionName: 'people', links: customLinks}, function(err, itemSchema) {
                if (err) { return done(err); }

                ItemSchema.findOne({'collectionName': 'people'}, function(err, itemSchema) {
                    if (err) { return done(err); }

                    expect(itemSchema.__data.links).to.eql([
                        { rel: 'custom', href: '/custom' }
                    ]);

                    done(err);
                });
            });
        });
    });

    describe('.findByCollectionName', function() {
        beforeEach(function() {
            this.sinon.stub(logger, 'info');
            this.sinon.stub(logger, 'warn');
        });

        it('should find ItemSchema by collection name', function(done) {
            var callback = function(err, itemSchema) {
                expect(itemSchema.collectionName).to.eq('people');
                done();
            };

            ItemSchema.create({collectionName: 'people' }, function(err) {
                if (err) { return done(err); }
                ItemSchema.findByCollectionName('people', callback);
            });
        });

        it('should log when collection JSON schema was not found', function(done) {
            var callback = function(err) {
                if (err) { return done(err); }
                expect(logger.warn).to.have.been.calledWith('JSON Schema for collectionName', 'people', 'not found.');
                done();
            };

            ItemSchema.findByCollectionName('people', callback);
        });
    });

    describe('#registerModel', function() {
        describe('hooks', function(){
            describe('when called twice', function() {
                var citySchema;

                beforeEach(function(done) {
                    ItemSchema.defineRemoteHooks = this.sinon.spy(ItemSchema.defineRemoteHooks);
                    citySchema = new ItemSchema({collectionName: 'cities'});

                    var cityModel = citySchema.constructModel();

                    citySchema.registerModel(cityModel, function(err) {
                        if (err) { return done(err); }

                        citySchema.registerModel(cityModel, function(err) {
                            if (err) { return done(err); }
                            done();
                        });
                    });
                });

                it('should register remote hooks only once', function() {
                    expect(ItemSchema.defineRemoteHooks).to.have.callCount(1);
                });
            });
        });

        describe('validation', function() {
            var schemaDefinition = {
                collectionName: 'people',
                properties: {
                    firstName: {
                        type: "string"
                    },
                    age: {
                        "type": "integer",
                        "minimum": 18
                    }
                },
                required : ["firstName", "age"],
            };

            it('should not return error when instance is valid', function(done) {
                ItemSchema.create(schemaDefinition, function(err, itemSchema) {
                    if (err) { return done(err); }

                    var PersonInvalid = itemSchema.constructModel();

                    itemSchema.registerModel(PersonInvalid, function(err) {
                        var alice = new PersonInvalid({ firstName: 'Alice', age : 18 });
                        alice.isValid(function(valid) {
                            expect(valid).to.be.true;
                            expect(alice.errors).to.be.false;
                            done(err);
                        });
                    });
                });
            });

            it('should return error when instance is invalid', function(done) {
                ItemSchema.create(schemaDefinition, function(err, itemSchema) {
                    if (err) { return done(err); }

                    var PersonInvalid = itemSchema.constructModel();

                    itemSchema.registerModel(PersonInvalid, function(err) {
                        var alice = new PersonInvalid({ age : 1 });

                        alice.isValid(function(valid) {
                            expect(valid).to.be.false;
                            expect(alice.errors['/firstName'][0]).to.be.eql('Missing required property: firstName');
                            expect(alice.errors['/age'][0]).to.be.eql('Value 1 is less than minimum 18');
                            expect(alice.errors['_all'][0]).to.be.eql('Instance is invalid');
                            expect(alice.errors.codes['/firstName'][0]).to.be.eql(302);
                            expect(alice.errors.codes['/age'][0]).to.be.eql(101);
                            expect(alice.errors.codes['_all'][0]).to.be.eql('custom');
                            done(err);
                        });
                    });
                });
            });
        });
    });
});
