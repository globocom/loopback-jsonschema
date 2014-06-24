var logger = require('../support/logger');
var util = require('util');

function JsonSchemaValidator(schema_version) {
    if (schema_version === 'http://json-schema.org/draft-04/hyper-schema#') {
        return new Draft4();
    } else {
        return null;
    }
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
