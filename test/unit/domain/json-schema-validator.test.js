require('../../support');

var expect = require('chai').expect;
var JSV = require('JSV').JSV;

var JsonSchemaValidator = require('../../../lib/domain/json-schema-validator');
var config = require('../../../lib/support/config');

describe('JsonSchemaValidator', function() {
    var jsonSchemaValidator;

    it('should return null when the json schema version is not supported', function () {
        jsonSchemaValidator = new JsonSchemaValidator('unsupported-version');
        var data = {};
        data.toObject = this.sinon.stub().returns({});
        expect(jsonSchemaValidator.validate({}, data)).to.be.null;
    });

    describe('draft3', function() {
        beforeEach(function() {
            jsonSchemaValidator = new JsonSchemaValidator('http://json-schema.org/draft-03/hyper-schema#');
            config.jsonSchemaValidatorTranslation = {};
        });

        it('should be able to validate a schema following draft3 rules', function () {
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
                        "lastName": {
                            "type": "string",
                        },
                        "age": {
                            "type": "integer",
                            "minimum": 10,
                            "required": true
                        },
                        "count": {
                            "type": "integer"
                        }
                    }
                };
            });

            it('should return the formatted errors and the count', function() {
                var data = {};
                data.toObject = this.sinon.stub().returns({});
                var errors = jsonSchemaValidator.validate({}, data);
                expect(errors).to.have.keys(['items', 'itemCount']);
            });

            describe('required fields', function() {
                it('should return a list of fields with error', function () {
                    var data = {};
                    data.toObject = this.sinon.stub().returns({
                        age: 1
                    });

                    var errors = jsonSchemaValidator.validate(schema, data);
                    expect(errors.itemCount).to.eq(2);
                    expect(errors.items).to.eql([{
                            code: 302,
                            property: '/firstName',
                            message: "Property is required",
                            dataPath: '/firstName',
                            schemaPath: '/properties/firstName'
                        },
                        {
                            code: 101,
                            property: '/age',
                            message: "Number is less than the required minimum value",
                            dataPath: '/age',
                            schemaPath: '/properties/age'
                    }]);
                });

                it('should return unknown error code and original message when the error is not handled', function () {
                    var env = {
                        validate: this.sinon.stub().returns({ errors: [{message: 'custom-error-message'}] })
                    };
                    this.sinon.stub(JSV, 'createEnvironment').returns(env);

                    var data = {};
                    data.toObject = this.sinon.stub().returns({});

                    var errors = jsonSchemaValidator.validate(schema, data);
                    expect(errors.itemCount).to.eq(1);
                    expect(errors.items).to.eql([{
                        code: 1000,
                        message: "custom-error-message"
                    }]);
                });

                it('should allow to translate error messages using config', function () {
                    config.jsonSchemaValidatorTranslation = {
                        draft3: {
                            language: 'pt-br',
                            mapping: {
                                OBJECT_REQUIRED: "Campo requerido",
                            }
                        }
                    };

                    var data = {};
                    data.toObject = this.sinon.stub().returns({
                        age: 50
                    });

                    var errors = jsonSchemaValidator.validate(schema, data);
                    expect(errors.itemCount).to.eq(1);
                    expect(errors.items).to.eql([{
                            code: 302,
                            property: '/firstName',
                            message: "Campo requerido",
                            dataPath: '/firstName',
                            schemaPath: '/properties/firstName'
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

                    var data = {};
                    data.toObject = this.sinon.stub().returns({
                        tags: []
                    });

                    var errors = jsonSchemaValidator.validate(schema, data);
                    expect(errors.itemCount).to.eq(3);
                    expect(errors.items).to.eql([{
                        code: 302,
                        property: '/firstName',
                        dataPath: "/firstName",
                        message: "Property is required",
                        schemaPath: "/properties/firstName"
                    },
                    {
                        code: 302,
                        property: '/age',
                        dataPath: "/age",
                        message: "Property is required",
                        schemaPath: "/properties/age"
                    },
                    {
                        code: 400,
                        property: '/tags',
                        dataPath: "/tags",
                        message: "The number of items is less than the required minimum",
                        schemaPath: "/properties/tags"
                    }]);
                });
            });

            describe('with null and undefined properties', function() {
                it('should remove null and undefined properties before validating', function() {
                    var data = {};
                    data.toObject = this.sinon.stub().returns({
                        firstName: 'Alice',
                        lastName: null,
                        age: 30,
                        count: undefined
                    });
                    var errors = jsonSchemaValidator.validate(schema, data);
                    expect(errors.itemCount).to.eq(0);
                });
            });
        });
    });

    describe('draft4', function() {
        beforeEach(function() {
            jsonSchemaValidator = new JsonSchemaValidator('http://json-schema.org/draft-04/hyper-schema#');
        });

        it('should be able to validate a schema following draft4 rules', function () {
            var data = {};
            data.toObject = this.sinon.stub().returns({});
            expect(jsonSchemaValidator.validate({}, data)).to.not.be.null;
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
                var data = {};
                data.toObject = this.sinon.stub().returns({});
                var errors = jsonSchemaValidator.validate({}, data);
                expect(errors).to.have.keys(['items', 'itemCount']);
            });

            describe('required fields', function() {
                it('should return a list of fields with error', function () {
                    schema.required = ["firstName", "age"];

                    var data = {};
                    data.toObject = this.sinon.stub().returns({});
                    var errors = jsonSchemaValidator.validate(schema, data);
                    expect(errors.itemCount).to.eq(2);
                    expect(errors.items).to.eql([{
                            code: 302,
                            property: '/firstName',
                            message: "Missing required property: firstName",
                            dataPath: '',
                            schemaPath: '/required/0'
                        },
                        {
                            code: 302,
                            property: '/age',
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

                    var data = {};
                    data.toObject = this.sinon.stub().returns({
                        tags: []
                    });
                    var errors = jsonSchemaValidator.validate(schema, data);
                    expect(errors.itemCount).to.eq(1);
                    expect(errors.items).to.eql([{
                        code: 400,
                        property: '/tags',
                        dataPath: "/tags",
                        message: "Array is too short (0), minimum 1",
                        schemaPath: "/properties/tags/minItems"
                    }]);
                });
            });

            describe('with null and undefined properties', function() {
                it('should remove null and undefined properties before validating', function() {
                    var data = {};
                    data.toObject = this.sinon.stub().returns({
                        firstName: null,
                        age: undefined
                    });
                    var errors = jsonSchemaValidator.validate(schema, data);
                    expect(errors.itemCount).to.eq(0);
                });
            });
        });
    });
});