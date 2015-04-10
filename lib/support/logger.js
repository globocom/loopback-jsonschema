var stackTrace = require('stack-trace');
var winston = require('winston');

var logLevel = process.env['LOG_LEVEL'] || 'warn';

var loggerInstance = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            label: 'loopback-jsonschema',
            level: logLevel,
            timestamp: false
        })
    ]
});

var logger = module.exports = loggerInstance;

if (logLevel === 'debug') {
    logger.debug = function() {
        var callSite = stackTrace.get()[1];
        var fileNameParts = callSite.getFileName().split('/');
        var fileName = fileNameParts[fileNameParts.length - 1];
        var callSiteInfo = '[' + fileName + ':' + callSite.getLineNumber() + ']';
        var args = ['debug', callSiteInfo].concat(Array.prototype.slice.call(arguments));
        logger.log.apply(this, args);
    };
    logger.debug.enabled = true;
} else {
    logger.debug = function() {};
    logger.debug.enabled = false;
}
