var util = require('util');
var jsonPath = require('json-path');
var _ = require('underscore');
var traverse = require('traverse');


var logger = require('../support/logger');
var config = require('../support/config');

function JsonSchemaValidator(schemaVersion) {
    schemaVersion   = typeof schemaVersion !== 'undefined' ? schemaVersion : 'http://json-schema.org/draft-04/hyper-schema#';
    this.version     = schemaVersion;
}

JsonSchemaValidator.prototype.validate = function(schema, data) {
    if (this.version === 'http://json-schema.org/draft-04/hyper-schema#') {
        return Draft4.validate(schema, data);
    } else if (this.version === 'http://json-schema.org/draft-03/hyper-schema#') {
        return Draft3.validate(schema, data);
    } else {
        return null;
    }
};

var Draft3 = (function(){
    function formatError(result) {
        var errors = [];

        var error;
        result.errors.forEach(function(err) {
            error = translateMessage(err.message);
            var obj = {};
            obj.code = error.codeNumber;
            obj.property = extractPathFromUri(err.uri);
            obj.message = error.message;
            obj.dataPath = extractPathFromUri(err.uri);
            obj.schemaPath = extractPathFromUri(err.schemaUri);

            deleteEmptyKeys(obj);
            errors.push(obj);
        });

        return {
            items: errors,
            itemCount: result.errors.length
        };
    }

    function deleteEmptyKeys(obj) {
        Object.keys(obj).forEach(function(k) {
            if (!obj[k]) {
                delete obj[k];
            }
        });
    }

    function extractPathFromUri(uri) {
        var re = /.*#\/(.*)/;
        var ary = re.exec(uri);

        if (!_.isEmpty(ary)) {
            return '/' + ary[1];
        }
    }

    function translateMessage(originalMessage) {
        var codesMapping = {
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
            "Property is required"              : "OBJECT_REQUIRED",
            "Instance is not a required type"   : "INVALID_TYPE",
            "Additional items are not allowed"  : "ARRAY_ADDITIONAL_ITEMS",
            "Number is less than the required minimum value"            : "NUMBER_MINIMUM",
            "Number is greater than the required maximum value"         : "NUMBER_MAXIMUM",
            "The number of items is less than the required minimum"     : "ARRAY_LENGTH_SHORT",
            "The number of items is greater than the required maximum"  : "ARRAY_LENGTH_LONG",
            "Invalid pattern" : "STRING_PATTERN",
            "String is less than the required minimum length"       : "STRING_LENGTH_SHORT",
            "String is greater than the required maximum length"    : "STRING_LENGTH_LONG",
            "Instance is not one of the possible values"            : "ENUM_MISMATCH",
            "String is not in the required format"                  : "FORMAT_CUSTOM",
            "Array can only contain unique items"                   : "ARRAY_UNIQUE",
            "The number of decimal places is greater than the allowed maximum" : "MAX_DECIMAL",
            "Instance is a disallowed type"         : "DISALLOWED_TYPE",
            "Instance's URI does not start with"     : "URI_DOESNOT_START_WITH"
        };

        var msg = {
            message: originalMessage
        };

        var translation = traverse(config.jsonSchemaValidatorTranslation).get(['draft3','mapping']);
        if (translation !== undefined) {
            msg.message = translation[errorMessagesMapping[originalMessage]] || originalMessage;
        }

        msg.codeNumber = codesMapping[errorMessagesMapping[originalMessage]] || codesMapping.UNKNOWN_PROPERTY;
        return msg;
    }

    return {
        validate : function(schema, data) {
            var JSV = require('JSV').JSV;
            var env = JSV.createEnvironment('json-schema-draft-03');
            // FIXME: This is needed because JSV validates the schema, and the `id` keyword cannot be an ObjectId. See issue #12.
            schema.$id = String(schema.$id);
            var result = env.validate(data, schema);

            return formatError(result);
        }
    };
})();

var Draft4 = (function(){
    function formatError(schema, result) {
        var errors = [];

        result.errors.forEach(function(error) {
            var obj = {};
            obj.code = error.code;
            if (error.schemaPath.indexOf('required') !== -1) {
                obj.property = error.dataPath +"/" + jsonPath.resolve(schema, error.schemaPath);
            } else {
                obj.property = error.dataPath;
            }
            obj.message = error.message;
            obj.dataPath = error.dataPath;
            obj.schemaPath = error.schemaPath;
            errors.push(obj);
        });

        return {
            items: errors,
            itemCount: result.errors.length
        };
    }

    return {
        validate: function(schema, data) {
            var tv4 = require('tv4');
            var translation = config.jsonSchemaValidatorTranslation.draft4 || {};
            if (!_.isEmpty(translation)) {
                tv4.addLanguage(translation.language, translation.mapping);
                tv4.language(translation.language);
            }

            var result = tv4.validateMultiple(data, schema);

            return formatError(schema, result);
        }
    };
})();

module.exports = JsonSchemaValidator;
