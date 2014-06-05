var LJSUrl = require('../http/ljs-url');

var logger = require('../support/logger');


function LJSRequest(req, app) {
    this.req = req;
    this.body = req && req.body;
    this.method = req && req.method;
    this.app = app;
};


LJSRequest.prototype.schemeAndAuthority = function() {
    this._schemeAndAuthority = this._schemeAndAuthority || this.req.protocol + '://' + this.req.get('Host');
    return this._schemeAndAuthority;
};

LJSRequest.prototype.baseUrl = function() {
    if (!this._baseUrl) {
        this._baseUrl = this.schemeAndAuthority() + this.app.get('restApiRoot');
    }
    logger.debug('[LJSReq#baseUrl]:', this._baseUrl);
    return this._baseUrl;
};

LJSRequest.prototype.fullUrl = function() {
    return this.schemeAndAuthority() + this.req.originalUrl;
};

LJSRequest.prototype.ljsUrl = function() {
    this._ljsUrl = this._ljsUrl || new LJSUrl(this.fullUrl());
    return this._ljsUrl;
};


module.exports = LJSRequest;
