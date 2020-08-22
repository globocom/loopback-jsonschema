var modelPropertiesConverter = {
    convert: function(data) {
        if (data.indexes) {
            sanitizeIndexes(data.indexes, '.', '%2E');
        }

        if (data.$schema) {
            sanitizeSchema.call(this, data, data.$schema);
            if (data.__data) {
                sanitizeSchema.call(this, data.__data, data['%24schema']);
            }
        }

        if (data.collectionLinks) {
            sanitizeLinks(data.collectionLinks, '.', '%2E');
        }

        if (data.links) {
            sanitizeLinks(data.links, '.', '%2E');
        }

        if (data.versionIndexes) {
            sanitizeIndexes(data.versionIndexes, '.', '%2E');
        }
    },

    restore: function(model) {
        if (model.indexes) {
            sanitizeIndexes(model.indexes, '%2E', '.');
        }

        if (model.collectionLinks) {
            sanitizeLinks(model.collectionLinks, '%2E', '.');
        }

        if (model.links) {
            sanitizeLinks(model.links, '%2E', '.');
        }

        if (model.versionIndexes) {
            sanitizeIndexes(model.versionIndexes, '%2E', '.');
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

function sanitizeIndexes(indexes, orig, replace) {
    sanitizeKeys(indexes, function(keys) {
        var sanitized = {};

        for (var keyIndex in keys) {
            var value = keys[keyIndex];
            if (keyIndex.indexOf(orig) >= 0){
                sanitized[sanitizeKey(keyIndex, orig, replace)] = value;
            } else {
                sanitized[keyIndex] = value;
            }
        }

        return sanitized;
    });
}

function sanitizeKey(key, orig, replace) {
    while (key.indexOf(orig) >= 0){
        key = key.replace(orig, replace)
    }
    return key
}

function sanitizeLinks(links, orig, replace) {
    for (var i=0; i<links.length; i++) {
        sanitizeLink(links[i], orig, replace);
    }
}

function sanitizeLink(link, orig, replace) {
    if (link.schema && link.schema.properties) {
        var properties = link.schema.properties;
        for (var propertyName in properties) {
            if (propertyName.indexOf(orig) >= 0) {
                properties[propertyName.replace(orig, replace)] = properties[propertyName];
                delete properties[propertyName];
            }
        }
    }
}

function sanitizeKeys(indexes, operation) {
    for (var indexObject in indexes) {
        indexes[indexObject] = operation(getIndexKeys(indexes[indexObject]));
    }
}

module.exports = modelPropertiesConverter;
