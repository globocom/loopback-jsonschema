var _ = require('underscore');

var makeCached = require('../support/make-cached');

var models = module.exports = {
    fromPluralModelName: makeCached(fromPluralModelName, fromPluralModelNameCacheKey)
};

function fromPluralModelName(app, pluralModelName) {
    return _.find(app.models(), function(Model) {
        return Model.pluralModelName === pluralModelName;
    });
}

function fromPluralModelNameCacheKey(app, pluralModelName) {
    return pluralModelName;
}
