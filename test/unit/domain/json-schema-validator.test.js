require('../../support');

var expect = require('chai').expect;

var JsonSchemaValidator = require('../../../lib/domain/json-schema-validator');
var ValidationError = require('loopback').ValidationError;

describe('JsonSchemaValidator', function() {
    var jsonSchemaValidator;

    it('should return null when the json schema version is not supported', function () {
        jsonSchemaValidator = JsonSchemaValidator('unsupported-version');
        expect(jsonSchemaValidator).to.be.null;
    });

    describe('draft3', function() {
        beforeEach(function() {
            jsonSchemaValidator = JsonSchemaValidator('http://json-schema.org/draft-03/hyper-schema#');
        });

        it('should be able to validate a schema following draft4 rules', function () {
            expect(jsonSchemaValidator).to.not.be.null;
        });

        describe('#validate', function() {
            var schema;

            beforeEach(function () {
                schema = {
                    "title": "Example Schema",
                    "type": "object",
                    "properties": {
                        "firstName": {
                            "type": "string",
                            "required": true
                        },
                        "age": {
                            "type": "integer",
                            "minimum": 10,
                            "required": true
                        }
                    }
                };
            });

            it('should return the formatted errors and the count', function() {
                var errors = jsonSchemaValidator.validate({}, {});
                expect(errors).to.have.keys(['items', 'itemCount']);
            });

            describe('required fields', function() {
                it('should return a list of fields with error', function () {
                    var data = {age: 1};

                    var errors = jsonSchemaValidator.validate(schema, data);
                    expect(errors.itemCount).to.eq(2);
                    expect(errors.items).to.eql([{
                            code: 302,
                            message: "Missing required property",
                            dataPath: '/firstName',
                            schemaPath: '/properties/firstName'
                        },
                        {
                            code: 101,
                            message: "Value is less than minimum",
                            dataPath: '/age',
                            schemaPath: '/properties/age'
                    }]);
                });
            });
        });
    });

    describe('draft4', function() {
        beforeEach(function() {
            jsonSchemaValidator = JsonSchemaValidator('http://json-schema.org/draft-04/hyper-schema#');
        });

        it('should be able to validate a schema following draft4 rules', function () {
            expect(jsonSchemaValidator).to.not.be.null;
        });

        describe('#validate', function() {
            var schema;

            beforeEach(function () {
                schema = {
                    "title": "Example Schema",
                    "type": "object",
                    "properties": {
                        "firstName": {
                            "type": "string"
                        },
                        "age": {
                            "type": "integer"
                        }
                    }
                };
            });

            it('should return the formatted errors and the count', function() {
                var errors = jsonSchemaValidator.validate({}, {});
                expect(errors).to.have.keys(['items', 'itemCount']);
            });

            describe('required fields', function() {
                it('should return a list of fields with error', function () {
                    schema.required = ["firstName", "age"];

                    var data = {};
                    var errors = jsonSchemaValidator.validate(schema, data);
                    expect(errors.itemCount).to.eq(2);
                    expect(errors.items).to.eql([{
                            code: 302,
                            message: "Missing required property: firstName",
                            dataPath: '',
                            schemaPath: '/required/0'
                        },
                        {
                            code: 302,
                            message: "Missing required property: age",
                            dataPath: '',
                            schemaPath: '/required/1'
                    }]);
                });
            });

            describe('array errors', function () {
                it('should have at least the minItems value', function () {
                    schema.properties.tags = {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "minItems": 1,
                        "uniqueItems": true
                    };

                    var data = {tags: []};
                    var errors = jsonSchemaValidator.validate(schema, data);
                    expect(errors.itemCount).to.eq(1);
                    expect(errors.items).to.eql([{
                        code: 400,
                        dataPath: "/tags",
                        message: "Array is too short (0), minimum 1",
                        schemaPath: "/properties/tags/minItems"
                    }]);
                });
            });
        });
    });
});