var _ = require('lodash');
var traverse = require('traverse');

var logger = require('../support/logger');


module.exports = function readOnlyDefaultValuesHandler(ctx) {
    logger.debug('Entered readOnlyDefaultValuesHandler.');

    var method = ctx.req.method;

    if (method !== 'POST' && method !== 'PUT') {
        return;
    }

    var payload = ctx.req.body;
    var properties = ctx.method.ctor.definition.rawProperties;
    var traversePayload = traverse(payload);
    var traverseInstance = traverse(ctx.instance ? ctx.instance.__data : null);

    return schemaWalk(properties, [], traversePayload, method, traverseInstance);
};

function isNullValue(value) {
    return (value === null || value === undefined);
}

function walkOnObjectProperties(schema, bodyItems, method) {
    for(var i = 0; i < bodyItems.length; i++) {
        schemaWalk(schema.properties, [], traverse(bodyItems[i]), method);
    }
}

function walkOnArrayProperties(schemas, additionalSchema, bodyItems, method) {
    var arraySchema;
    var nestedProperties;
    var i;

    for(i = 0; i < schemas.length; i++) {
        arraySchema = schemas[i];

        if (arraySchema.type === 'object') {
            nestedProperties = arraySchema.properties;

            if (nestedProperties) {
                schemaWalk(nestedProperties, [], traverse(bodyItems[i]), method);
            }
        }
    }

    if (additionalSchema) {
        for(i = schemas.length; i < bodyItems.length; i++) {
            schemaWalk(additionalSchema.properties, [], traverse(bodyItems[i]), method);
        }
    }
}

function schemaWalk(properties, propertyPath, traversePayload, method, traverseInstance) {
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
                schemaWalk(nestedProperties, path, traversePayload, method, traverseInstance);
            }

            continue;
        } else if (propertyType === 'array') {
            bodyItems = traversePayload.get(path);

            if (!_.isArray(bodyItems)) {
                continue;
            }

            schema = property.items;
            if (_.isArray(schema)) {
                walkOnArrayProperties(schema, property.additionalItems, bodyItems, method);
            } else if (_.isObject(schema)) {
                walkOnObjectProperties(schema, bodyItems, method);
            }
        }

        if (property.readOnly) {
            removeReadOnlyProperty(traversePayload, path);
        }

        if (typeof property.default !== 'undefined') {
            applyDefaultPropertyValue(traversePayload, path, property.default, method, traverseInstance);
        }
    }

    return traversePayload.value;
}

function removeReadOnlyProperty(traversePayload, path) {
    var node = traversePayload.value;
    var pathSize = path.length - 1;

    for (var i = 0; i < pathSize; i++) {
        node = node[path[i]];

        if (isNullValue(node)) {
            return;
        }
    }

    delete node[path[pathSize]];
}

function applyDefaultPropertyValue(traversePayload, path, defaultValue, method, traverseInstance) {
    var rootPath = path.slice(0, 1);
    var value = traversePayload.has(path);

    if (value) {
      return;
    }

    if (method === "PUT" && traverseInstance && traverseInstance.value) {
      var hasRootOnInstanceProperty = traverseInstance.has(rootPath);
      var hasRootOnPayloadProperty = traversePayload.has(rootPath);

      if (!hasRootOnInstanceProperty && !hasRootOnPayloadProperty) {
        traversePayload.set(path, defaultValue);
      } else if (hasRootOnPayloadProperty) {
        traversePayload.set(path, defaultValue);
      }
    }

    if (method === 'POST') {
        traversePayload.set(path, defaultValue);
    }
}
