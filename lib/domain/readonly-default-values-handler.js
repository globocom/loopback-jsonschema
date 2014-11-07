var _ = require('underscore');
var traverse = require('traverse');

module.exports = function readOnlyDefaultValuesHandler(ctx) {
    var model = ctx.method.ctor;
    var traverseBody = traverse(ctx.req.body);
    var properties = model.definition.properties;

    return schemaWalk(properties, [], traverseBody);
};

function isNullValue(value) {
    return (value === null || value === undefined);
}

function walkOnObjectProperties(schema, bodyItems) {
    for(var i = 0; i < bodyItems.length; i++) {
        schemaWalk(schema.properties, [], traverse(bodyItems[i]));
    }
}

function walkOnArrayProperties(schemas, bodyItems) {
    var arraySchema;
    var nestedProperties;

    for(var i = 0; i < schemas.length; i++) {
        arraySchema = schemas[i];

        if (arraySchema.type == 'object') {
            nestedProperties = arraySchema.properties;

            if (nestedProperties) {
                schemaWalk(nestedProperties, [], traverse(bodyItems[i]));
            }
        }
    }
}

function schemaWalk(properties, propertyPath, traverseBody) {
    var arrayModel;
    var bodyItems;
    var nestedProperties;
    var path;
    var property;
    var propertyType;
    var schema;

    for (var key in properties) {
        path = propertyPath.slice(0);
        path.push(key);
        property = properties[key];

        propertyType = property.type;
        if (propertyType === 'object') {
            nestedProperties = property.properties;

            if (nestedProperties) {
                schemaWalk(nestedProperties, path, traverseBody);
            }

            continue;
        } else if (propertyType === 'array') {
            bodyItems = traverseBody.get(path);

            if (!_.isArray(bodyItems)) {
                continue;
            }

            schema = property.items;
            if (_.isArray(schema)) {
                walkOnArrayProperties(schema, bodyItems);
            } else if (_.isObject(schema)) {
                walkOnObjectProperties(schema, bodyItems);
            }
        }

        if (property.readOnly) {
            removeReadOnlyProperty(traverseBody, path);
        }

        if (property.default) {
            applyDefaultPropertyValue(traverseBody, path, property.default);
        }
    }

    return traverseBody.value;
}

function removeReadOnlyProperty(traverseBody, path) {
    var node = traverseBody.value;
    var pathSize = path.length - 1;

    for(var i = 0; i < pathSize; i++) {
        node = node[path[i]];

        if (isNullValue(node)) {
            return;
        }
    }

    delete node[path[pathSize]];
}

function applyDefaultPropertyValue(traverseBody, path, defaultValue) {
    var value = traverseBody.has(path);

    if (!value) {
        traverseBody.set(path, defaultValue);
    }
}
