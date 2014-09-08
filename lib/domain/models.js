var _ = require('underscore');

module.exports = {
    fromPluralModelName: function(app, pluralModelName) {
        return _.find(app.models(), function(Model) {
            return Model.pluralModelName === pluralModelName;
        });
    }
};
