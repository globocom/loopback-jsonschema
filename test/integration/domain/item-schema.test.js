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
            ItemSchema.create({modelName: 'test'}, function(err, instance) {
                if (err) { throw err };
                done();
            });
        });

        it('should have $schema', function() {
            ItemSchema.findOne({where: {modelName: 'test'}}, function(err, itemSchema) {
                if (err) {
                    logger.log(err);
                }
                expect(itemSchema.$schema).to.exist;
            });
        });
    });

    describe('.create', function() {
        it('should set $schema', function() {
            ItemSchema.create({modelName: 'test'}, function(err, itemSchema) {
                if (err) {
                    logger.log(err);
                }
                expect(itemSchema.$schema).to.exist;
            });
        });

        it('should create model defined by the json schema provided', function() {
            ItemSchema.create({modelName: 'test'}, function(err) {
                if (err) {
                    logger.log(err);
                }
                expect(loopback.getModel('test')).to.exist;
            });
        });

        it('should save custom links', function() {
            var customLinks = [{ rel: 'custom', href: '/custom' }];
            ItemSchema.create({modelName: 'test', collectionName: 'people', links: customLinks}, function(err, itemSchema) {
                if (err) { throw err; }
                expect(itemSchema.links).to.eql([
                    { rel: 'self', href: '/people/{id}' },
                    { rel: 'item', href: '/people/{id}' },
                    {
                        rel: 'create',
                        method: 'POST',
                        href: '/people',
                        schema: {
                            $ref: '/item-schemas/' + itemSchema.id
                        }
                    },
                    { rel: 'update', method: 'PUT', href: '/people/{id}' },
                    { rel: 'delete', method: 'DELETE', href: '/people/{id}' },
                    { rel: 'custom', href: '/custom' }
                ]);
            });
        });

        it('should not allow overriding default links', function() {
            var customLinks = [{ rel: 'self', href: '/custom' }];
            ItemSchema.create({modelName: 'test', collectionName: 'people', links: customLinks}, function(err, itemSchema) {
                if (err) { throw err; }
                expect(itemSchema.links).to.eql([
                    { rel: 'self', href: '/people/{id}' },
                    { rel: 'item', href: '/people/{id}' },
                    {
                        rel: 'create',
                        method: 'POST',
                        href: '/people',
                        schema: {
                            $ref: '/item-schemas/' + itemSchema.id
                        }
                    },
                    { rel: 'update', method: 'PUT', href: '/people/{id}' },
                    { rel: 'delete', method: 'DELETE', href: '/people/{id}' }
                ]);
            });
        });

        it('should persist only custom links', function() {
            var customLinks = [{ rel: 'self', href: '/people/{id}' }, { rel: 'custom', href: '/custom' }];

            var afterSaveOriginal = ItemSchema.afterSave;

            // prevent links be overridden
            ItemSchema.afterSave = function(next) {
                next();
            };

            ItemSchema.create({modelName: 'test', collectionName: 'people', links: customLinks}, function(err, itemSchema) {
                if (err) { throw err; }
                expect(itemSchema.links).to.eql([
                    { rel: 'custom', href: '/custom' }
                ]);

                ItemSchema.afterSave = afterSaveOriginal;
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
                expect(itemSchema.modelName).to.eq('person');
                done();
            };

            ItemSchema.create({ modelName: 'person', collectionName: 'people' }, function(err) {
                if (err) { throw err; }
                ItemSchema.findByCollectionName('people', callback);
            });
        });

        it('should log when collection JSON schema was not found', function(done) {
            var callback = function(err) {
                if (err) { throw err; }
                expect(logger.warn).to.have.been.calledWith('JSON Schema for collectionName', 'people', 'not found.');
                done();
            };

            ItemSchema.findByCollectionName('people', callback);
        });
    });
});
