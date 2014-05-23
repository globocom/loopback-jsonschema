var LJSUrl = require('../http/ljs-url');

function LJSRequest(req, app) {
    this.req = req;
    this.body = req && req.body;
    this.method = req && req.method;
    this.app = app;
};

LJSRequest.prototype.schemeAndAuthority = function() {
    return this.req.protocol + '://' + this.req.get('Host');
};

LJSRequest.prototype.baseUrl = function() {
    return this.schemeAndAuthority() + this.app.get('restApiRoot');
};

LJSRequest.prototype.fullUrl = function() {
    return this.schemeAndAuthority() + this.req.originalUrl;
};

LJSRequest.prototype.ljsUrl = function() {
    this._ljsUrl = this._ljsUrl || new LJSUrl(this.fullUrl());
    return this._ljsUrl;
};

module.exports = LJSRequest;