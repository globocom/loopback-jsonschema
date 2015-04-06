var logger = require('../support/logger');
var locationHeaderCorrelator = require('./location-header-correlator');

module.exports = function createLocationHook(model) {
    /*
     * Create a hook to correct response in after create method
     */

    logger.debug('include field location injector for model: ', model.modelName);
    model.afterRemote('create', locationHeaderCorrelator);
};
