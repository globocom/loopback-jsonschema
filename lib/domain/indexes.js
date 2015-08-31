var _ = require('lodash');
var logger = require('../support/logger');


module.exports = {
    create: function(model, callback) {
        var dataSource = model.getDataSource();
        var collectionName = model.collectionName;
        callback = callback || _.noop;

        if (dataSource.connector && dataSource.connector.autoupdate) {
            logger.info('Ensuring indexes for: ' + collectionName);

            dataSource.connector.autoupdate([collectionName], function ensureIndexCallback(err) {
                if (err) {
                    return callback(err);
                }

                logger.info('Ensured index for: ' + collectionName);
                callback(null, true);
            });
        } else {
            callback(null, false);
        }
    }
};
