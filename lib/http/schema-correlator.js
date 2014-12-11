var LJSRequest = require('./ljs-request');

module.exports = function schemaCorrelate(req, res, schemaUrl) {
    var baseUrl = new LJSRequest(req, req.app).baseUrl();
    var schemaAbsoluteUrl = baseUrl + schemaUrl;

    res.set('Content-Type', 'application/json; charset=utf-8; profile="' + schemaAbsoluteUrl + '"');
    res.set('Link', '<' + schemaAbsoluteUrl + '>; rel="describedby"');
};
