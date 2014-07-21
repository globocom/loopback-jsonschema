var modelPropertiesConverter = {
    convert: function(data) {
        if (data.$schema) {
            sanitizeSchema.call(this, data, data.$schema);
            if (data.__data) {
                sanitizeSchema.call(this, data.__data, data['%24schema']);
            }
        }
    },

    restore: function(model) {
        if (model['%24schema']) {
            model.$schema = model['%24schema'];
            model.__data.$schema = model['%24schema'];
            delete model['%24schema'];
            delete model.__data['%24schema'];
        }
    }
};

function sanitizeSchema(data, value) {
    data['%24schema'] = value;
    delete data.$schema;
}

module.exports = modelPropertiesConverter;
