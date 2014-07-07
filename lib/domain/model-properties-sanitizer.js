var modelPropertiesSanitizer = {
    sanitize: function(model) {
        if (model.$schema) {
            model['%24schema'] = model.$schema;
            model.__data['%24schema'] = model.$schema;
            delete model.$schema;
            delete model.__data.$schema;
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

module.exports = modelPropertiesSanitizer;
