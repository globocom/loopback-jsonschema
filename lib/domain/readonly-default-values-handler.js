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

function schemaWalk(properties, propertyPath, traverseBody) {
    var arrayModel;
    var bodyNode;
    var nestedProperties;
    var path;
    var property;
    var propertyType;
    var propertyItems;

    for (var key in properties) {
        path = propertyPath.slice(0);
        path.push(key);
        property = properties[key];

        propertyType = property.type;
        if (propertyType == 'object') {
            nestedProperties = property.properties;

            if (nestedProperties) {
                schemaWalk(nestedProperties, path, traverseBody);
            }

            continue;
        } else if (propertyType == 'array') {
            bodyNode = traverseBody.get(path);

            if (!_.isArray(bodyNode))
                continue;


            propertyItems = property.items;
            if (_.isArray(propertyItems)) {
                for(var i = 0; i < propertyItems.length; i++) {
                    var arraySchema = propertyItems[i];

                    if (arraySchema.type == 'object') {
                        nestedProperties = arraySchema.properties;

                        if (nestedProperties) {
                            schemaWalk(nestedProperties, [], traverse(bodyNode[i]));
                        }
                    }
                }
            }
            else if (_.isObject(propertyItems)) {
                arrayModel = propertyItems;

                for(var j = 0; j < bodyNode.length; j++) {
                    schemaWalk(arrayModel.properties, [], traverse(bodyNode[j]));
                }
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
