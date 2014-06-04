var winston = require('winston');

var config = require('./config');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            level: config.logLevel,
            timestamp: true
        })
    ]
});

module.exports = logger;