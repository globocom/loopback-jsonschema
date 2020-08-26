require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var ItemSchema = require('../../../lib/domain/item-schema');
var extendedValidation = require('../../../lib/domain/extended-validation');

var app = loopback();
app.set('restApiRoot', '/api');

describe('ItemSchema extended validation', function() {
    var errors;

    describe('when property and relation names clash', function() {
        var itemSchema;

        beforeEach(function(done) {
            var clashingSchema = {
                collectionName: "the-clash",
                properties: {
                    name: {
                        type: "string"
                    },
                    clash: {
                        type: "string"
                    }
                },
                relations: {
                    clash: {
                        collectionName: "the-clash",
                        type: "belongsToMe",
                        foreignKey: "clash"
                    }
                }
            }

            itemSchema = new ItemSchema(clashingSchema);

            done();
        });

        it('should be detected', function() {
            errors = extendedValidation(itemSchema);

            expect(errors.length).to.be.above(0);
        });

        describe('with weak validation enabled', function() {
            it('should be ignored', function() {
                itemSchema.weakValidation = true;
                errors = extendedValidation(itemSchema);

                expect(errors.length).to.eql(0);
            });
        });
    });

    describe('when property and relation names don\'t clash', function() {
        var itemSchema;

        beforeEach(function(done) {
            var clashingSchema = {
                collectionName: "no-clash",
                properties: {
                    name: {
                        type: "string"
                    },
                    clash: {
                        type: "string"
                    }
                },
                relations: {
                    clashRelation: {
                        collectionName: "no-clash",
                        type: "belongsToMe",
                        foreignKey: "noClash"
                    }
                }
            }

            itemSchema = new ItemSchema(clashingSchema);

            done();
        });

        it('should be detected', function() {
            errors = extendedValidation(itemSchema);

            expect(errors.length).to.eql(0);
        });

        describe('with weak validation enabled', function() {
            it('should be ignored', function() {
                itemSchema.weakValidation = true;
                errors = extendedValidation(itemSchema);

                expect(errors.length).to.eql(0);
            });
        });
    });

    describe('when reserved property names are used', function() {
        var itemSchema;
        var reservedNames;

        beforeEach(function(done) {
            var reservedProperties = {};
            reservedNames = [
                '__cachedRelations',
                '__data',
                '__dataSource',
                '__strict',
                '__persisted',
                'id',
                'created',
                'modified',
                'createdBy',
                'tenantId',
                'tenant',
                'versionId'
            ];
            reservedNames.forEach(n => reservedProperties[n] = { type: "string" });

            var schema = {
                collectionName: "reserved-properties",
                properties: reservedProperties
            }

            itemSchema = new ItemSchema(schema);

            done();
        });

        it('should be detected', function() {
            errors = extendedValidation(itemSchema);

            expect(errors.length).to.eql(reservedNames.length);
        });

        describe('with weak validation enabled', function() {
            it('should be ignored', function() {
                itemSchema.weakValidation = true;
                errors = extendedValidation(itemSchema);

                expect(errors.length).to.eql(0);
            });
        });
    });



});
