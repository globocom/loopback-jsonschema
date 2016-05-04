var modelPropertiesConverter = {
    convert: function(data) {
        if (data.indexes) {
            findKeys(data.indexes, function(keys){
                for (keyIndex in keys) {
                    if (keyIndex.indexOf('.') >= 0) {
                        keys[keyIndex.replace('.', '%2E')] = keys[keyIndex];
                        delete keys[keyIndex];
                    }
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
            findKeys(model.indexes, function(keys) {
                for (keyIndex in keys) {
                    var key = keys[keyIndex];
                    if (keyIndex.indexOf('%2E') >= 0){
                        keys[keyIndex.replace('%2E', '.')] = keys[keyIndex];
                        delete keys[keyIndex];
                    }
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

function getIndexKeys(index) {
    return index.keys? index.keys: index;
}

function sanitizeSchema(data, value) {
    data['%24schema'] = value;
    delete data.$schema;
}

function findKeys(indexes, operation) {
    for (var indexObject in indexes) {
        operation(getIndexKeys(indexes[indexObject]));
    }
}

module.exports = modelPropertiesConverter;
