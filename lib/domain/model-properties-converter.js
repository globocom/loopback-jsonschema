var modelPropertiesConverter = {
    convert: function(data) {
        if (data.indexes) {
            findIndexes(data.indexes, function(indexObject, index){
                if (index.indexOf('.') >= 0){
                    data.indexes[indexObject][index.replace('.', '%2E')] =
                    data.indexes[indexObject][index];
                    delete data.indexes[indexObject][index];
                }
            });
        }
        if (data.$schema) {
            sanitizeSchema.call(this, data, data.$schema);
            if (data.__data) {
                sanitizeSchema.call(this, data.__data, data['%24schema']);
            }
        }
    },

    restore: function(model) {
        if (model.indexes) {
            findIndexes(model.indexes, function(indexObject, index){
                if (index.indexOf('%2E') >= 0){
                    model.indexes[indexObject][index.replace('%2E', '.')] =
                    model.indexes[indexObject][index];
                    delete model.indexes[indexObject][index];
                }
            });
        }
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

function findIndexes(indexes, operation){
    for (var indexObject in indexes) {
        for (var index in indexes[indexObject]) {
            operation(indexObject, index);
        }
    }
}

module.exports = modelPropertiesConverter;
