var stackTrace = require('stack-trace');
var winston = require('winston');

var config = require('./config');

var loggerInstance = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            label: 'loopback-jsonschema',
            level: config.logLevel,
            timestamp: true
        })
    ]
});

var logger = module.exports = loggerInstance;

logger.debug = function() {
    var callSite = stackTrace.get()[1];
    var fileNameParts = callSite.getFileName().split('/');
    var fileName = fileNameParts[fileNameParts.length - 1];
    var callSiteInfo = '[' + fileName + ':' + callSite.getLineNumber() + ']';
    var args = ['debug', callSiteInfo].concat(Array.prototype.slice.call(arguments));
    logger.log.apply(this, args);
}