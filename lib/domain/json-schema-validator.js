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
    var JSV = require('jsv').JSV;
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
            OBJECT_REQUIRED: 302
        };

        var errorMessagesMapping = {
            "Property is required" : { code: errorCodes.OBJECT_REQUIRED, message: "Missing required property" }
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
