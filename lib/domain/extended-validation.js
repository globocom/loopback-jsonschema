function validateProperties(schema) {
    var reservedNames = [
        '__cachedRelations',
        '__data',
        '__dataSource',
        '__strict',
        '__persisted',
        'id',
        'created',
        'modified',
        'createdBy',
        'tenantId',
        'tenant',
        'versionId'
    ];

    var violations = [];
    var message = ' is a reserved property name';

    if(schema.properties) {
        for(var p in schema.properties) {
            if(reservedNames.includes(p)) {
                violations.push("'" + p + "'" + message)
            }
        }
    }

    return violations;
}

function validateRelations(schema) {
    var violations = [];

    if(!schema.properties || !schema.relations) {
        return violations;
    }

    var message = ' relation conflicts with property with the same name';
    var propertyNames = Object.keys(schema.properties);

    for(var r in schema.relations) {
        if(propertyNames.includes(r)) {
            violations.push("'" + r + "'" + message);
        }
    }

    return violations;
}

function extendedValidation(schema) {
    var errors = [];

    if(schema && !schema.weakValidation) {
        errors = validateProperties(schema);
        errors = errors.concat(validateRelations(schema));
    }

    return errors;
}


module.exports = extendedValidation
