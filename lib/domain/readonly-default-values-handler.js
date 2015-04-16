var _ = require('lodash');
var traverse = require('traverse');

var logger = require('../support/logger');


module.exports = function readOnlyDefaultValuesHandler(ctx) {
    logger.debug('Entered readOnlyDefaultValuesHandler.');

    var payload = ctx.req.body;
    var properties = ctx.method.ctor.definition.rawProperties;
    var traversePayload = traverse(payload);

    return schemaWalk(properties, [], traversePayload);
};

function isNullValue(value) {
    return (value === null || value === undefined);
}

function walkOnObjectProperties(schema, bodyItems) {
    for(var i = 0; i < bodyItems.length; i++) {
        schemaWalk(schema.properties, [], traverse(bodyItems[i]));
    }
}

function walkOnArrayProperties(schemas, additionalSchema, bodyItems) {
    var arraySchema;
    var nestedProperties;
    var i;

    for(i = 0; i < schemas.length; i++) {
        arraySchema = schemas[i];

        if (arraySchema.type === 'object') {
            nestedProperties = arraySchema.properties;

            if (nestedProperties) {
                schemaWalk(nestedProperties, [], traverse(bodyItems[i]));
            }
        }
    }

    if (additionalSchema) {
        for(i = schemas.length; i < bodyItems.length; i++) {
            schemaWalk(additionalSchema.properties, [], traverse(bodyItems[i]));
        }
    }
}

function schemaWalk(properties, propertyPath, traversePayload) {
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
                schemaWalk(nestedProperties, path, traversePayload);
            }

            continue;
        } else if (propertyType === 'array') {
            bodyItems = traversePayload.get(path);

            if (!_.isArray(bodyItems)) {
                continue;
            }

            schema = property.items;
            if (_.isArray(schema)) {
                walkOnArrayProperties(schema, property.additionalItems, bodyItems);
            } else if (_.isObject(schema)) {
                walkOnObjectProperties(schema, bodyItems);
            }
        }

        if (property.readOnly) {
            removeReadOnlyProperty(traversePayload, path);
        }

        if (property.default) {
            applyDefaultPropertyValue(traversePayload, path, property.default);
        }
    }

    return traversePayload.value;
}

function removeReadOnlyProperty(traversePayload, path) {
    var node = traversePayload.value;
    var pathSize = path.length - 1;

    for(var i = 0; i < pathSize; i++) {
        node = node[path[i]];

        if (isNullValue(node)) {
            return;
        }
    }

    delete node[path[pathSize]];
}

function applyDefaultPropertyValue(traversePayload, path, defaultValue) {
    var value = traversePayload.has(path);

    if (!value) {
        traversePayload.set(path, defaultValue);
    }
}
