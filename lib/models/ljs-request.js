function LJSRequest(req, app) {
    this.req = req;
    this.body = req.body;
    this.app = app;

    var paths = req.url.split("/");
    this.collectionName = paths[1];
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

module.exports = LJSRequest;