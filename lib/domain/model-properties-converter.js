var modelPropertiesConverter = {
    convert: function(data) {
        if (data.$schema) {
            sanitizeSchema.call(this, data, data.$schema);
            if (data.__data) {
                sanitizeSchema.call(this, data.__data, data['%24schema']);
            }
        }
        removeIdProperty.call(this, data);
        if (data.__data) {
            removeIdProperty.call(this, data.__data);
        }
    },

    restore: function(model) {
        if (model['%24schema']) {
            model.$schema = model['%24schema'];
            model.__data.$schema = model['%24schema'];
            delete model['%24schema'];
            delete model.__data['%24schema'];
        }
        addIdProperty.call(this, model);
        addIdProperty.call(this, model.__data);
    }
};

function removeIdProperty(data) {
    if (data.properties) {
        delete data.properties.id;
    }
}

function addIdProperty(data) {
    if (data.properties == null) {
        data.properties = {};
    }
    data.properties.id = {
        type: "string",
        title: "Unique identification of the resource"
    };
}

function sanitizeSchema(data, value) {
    data['%24schema'] = value;
    delete data.$schema;
}

module.exports = modelPropertiesConverter;
