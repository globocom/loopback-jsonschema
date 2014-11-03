var _ = require('underscore');

module.exports = function bodyFieldInjector(ctx) {
    var model = ctx.method.ctor;

    _.each(model.definition.properties, function(property, name) {
        if (property.readOnly) {
            delete this[name];
        }

        if (property.default && isNullValue(this[name])) {
            this[name] = property.default;
        }
    }, ctx.req.body);

    return ctx.req.body;
};

function isNullValue(value) {
    return (value === null || value === undefined);
}
