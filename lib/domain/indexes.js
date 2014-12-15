var _ = require('underscore');
var logger = require('../support/logger');


module.exports = {
    create: function(model, callback) {
        var dataSource = model.getDataSource();
        var modelName = model.modelName;
        callback = callback || _.noop;

        if (dataSource.connector && dataSource.connector.autoupdate) {
            logger.info('Ensuring indexes for: ' + modelName);

            dataSource.connector.autoupdate([modelName], function ensureIndexCallback(err) {
                if (err) {
                    return callback(err);
                }

                logger.info('Ensured index for: ' + modelName);
                callback(null, true);
            });
        } else {
            callback(null, false);
        }
    }
};