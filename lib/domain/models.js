var _ = require('lodash');
var util = require('util');


module.exports = {
    fromPluralModelName: util.deprecate(function(app, modelName) {
        return _.find(app.models(), function(Model) {
            return Model.modelName === modelName;
        });
    }, 'fromPluralModelName is deprecated, use loopback.findModel instead')
};
