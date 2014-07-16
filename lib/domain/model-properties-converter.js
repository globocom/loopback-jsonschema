var modelPropertiesConverter = {
    convert: function(data) {
        if (data.$schema) {
            data['%24schema'] = data.$schema;
            delete data.$schema;

            if (data.__data) {
                data.__data['%24schema'] = data['%24schema'];
                delete data.__data.$schema;
            }
        }
    },

    restore: function(model) {
        model.id = model.resourceId;
        model.__data.id = model.resourceId;

        if (model['%24schema']) {
            model.$schema = model['%24schema'];
            model.__data.$schema = model['%24schema'];
            delete model['%24schema'];
            delete model.__data['%24schema'];
        }
    }
};

module.exports = modelPropertiesConverter;
