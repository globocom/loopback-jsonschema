var logger = require('../support/logger');
var util = require('util');

function JsonSchemaValidator(schema_version) {
    if (schema_version === 'http://json-schema.org/draft-04/hyper-schema#') {
        return new Draft4();
    } else if (schema_version === 'http://json-schema.org/draft-03/hyper-schema#') {
        return new Draft3();
    } else {
        return null;
    }
};


function Draft3() {
    var JSV = require('JSV').JSV;
    var env = JSV.createEnvironment('json-schema-draft-03');

    this.validate = function(schema, data) {
        var result = env.validate(data, schema);
        return formatError(result);
    };

    function formatError(result) {
        var errors = [];

        var error;
        result.errors.forEach(function(err) {
            error = createErrorFor(err.message);

            var obj = {};
            obj.code = error.code;
            obj.message = error.message;
            obj.dataPath = extractPathFromUri(err.uri);
            obj.schemaPath = extractPathFromUri(err.schemaUri);
            errors.push(obj);
        });

        return {
            items: errors,
            itemCount: result.errors.length
        };
    };

    function extractPathFromUri(uri) {
        var re = /.*#\/(.*)/;
        var ary = re.exec(uri);
        return '/' + ary[1];
    };

    function createErrorFor(message) {
        var errorCodes = {
            INVALID_TYPE: 0,
            ENUM_MISMATCH: 1,
            ANY_OF_MISSING: 10,
            ONE_OF_MISSING: 11,
            ONE_OF_MULTIPLE: 12,
            NOT_PASSED: 13,
            // Numeric errors
            NUMBER_MULTIPLE_OF: 100,
            NUMBER_MINIMUM: 101,
            NUMBER_MINIMUM_EXCLUSIVE: 102,
            NUMBER_MAXIMUM: 103,
            NUMBER_MAXIMUM_EXCLUSIVE: 104,
            // String errors
            STRING_LENGTH_SHORT: 200,
            STRING_LENGTH_LONG: 201,
            STRING_PATTERN: 202,
            // Object errors
            OBJECT_PROPERTIES_MINIMUM: 300,
            OBJECT_PROPERTIES_MAXIMUM: 301,
            OBJECT_REQUIRED: 302,
            OBJECT_ADDITIONAL_PROPERTIES: 303,
            OBJECT_DEPENDENCY_KEY: 304,
            // Array errors
            ARRAY_LENGTH_SHORT: 400,
            ARRAY_LENGTH_LONG: 401,
            ARRAY_UNIQUE: 402,
            ARRAY_ADDITIONAL_ITEMS: 403,
            // Custom/user-defined errors
            FORMAT_CUSTOM: 500,
            KEYWORD_CUSTOM: 501,
            // Schema structure
            CIRCULAR_REFERENCE: 600,
            // DRAFT 3
            MAX_DECIMAL: 700,
            DISALLOWED_TYPE: 701,
            URI_DOESNOT_START_WITH: 702,

            // Non-standard validation options
            UNKNOWN_PROPERTY: 1000
        };

        var errorMessagesMapping = {
            "Property is required"              : { code: errorCodes.OBJECT_REQUIRED, message: "Missing required property" },
            "Instance is not a required type"   : { code: errorCodes.INVALID_TYPE,    message: "Invalid Type" },
            "Additional items are not allowed"  : { code: errorCodes.ARRAY_ADDITIONAL_ITEMS,        message: "Additional items not allowed" },
            "Additional items are not allowed"  : { code: errorCodes.OBJECT_ADDITIONAL_PROPERTIES,  message: "Additional properties not allowed" },
            "Number is less than the required minimum value"            : { code: errorCodes.NUMBER_MINIMUM, message: "Value is less than minimum" },
            "Number is greater than the required maximum value"         : { code: errorCodes.NUMBER_MAXIMUM, message: "Value is greater than maximum" },
            "The number of items is less than the required minimum"     : { code: errorCodes.ARRAY_LENGTH_SHORT,    message: "Array is too short" },
            "The number of items is greater than the required maximum"  : { code: errorCodes.ARRAY_LENGTH_LONG,     message: "Array is too long" },
            "Invalid pattern" : { code: errorCodes.STRING_PATTERN, message: "String does not match pattern" },
            "String is less than the required minimum length"       : { code: errorCodes.STRING_LENGTH_SHORT,   message: "String is too short" },
            "String is greater than the required maximum length"    : { code: errorCodes.STRING_LENGTH_LONG,    message: "String is too long" },
            "Instance is not one of the possible values"            : { code: errorCodes.ENUM_MISMATCH, message: "No enum match" },
            "String is not in the required format"                  : { code: errorCodes.FORMAT_CUSTOM, message: "Format validation failed" },
            "Array can only contain unique items"                   : { code: errorCodes.ARRAY_UNIQUE,  message: "Array items are not unique" },
            "The number of decimal places is greater than the allowed maximum" : { code: errorCodes.MAX_DECIMAL, message: "The number of decimal places is greater than the allowed maximum" },
            "Instance is a disallowed type"         : { code: errorCodes.DISALLOWED_TYPE,           message: "Instance is a disallowed type" },
            "Instance's URI does not start with"    : { code: errorCodes.URI_DOESNOT_START_WITH,    message: "Instance's URI does not start with" }
        };

        return errorMessagesMapping[message] || '';
    };
};

function Draft4() {
    var tv4 = require('tv4');

    this.validate = function(schema, data) {
        var result = tv4.validateMultiple(data, schema);
        return formatError(result);
    };

    function formatError(result) {
        var errors = [];

        result.errors.forEach(function(error) {
            var obj = {};
            obj.code = error.code;
            obj.message = error.message;
            obj.dataPath = error.dataPath;
            obj.schemaPath = error.schemaPath;
            errors.push(obj);
        });

        return {
            items: errors,
            itemCount: result.errors.length
        };
    };
};

module.exports = JsonSchemaValidator;
