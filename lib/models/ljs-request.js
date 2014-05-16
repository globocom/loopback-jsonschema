var LJSRequest = function(req, app) {
    this.req = req;
    this.body = req.body;
    this.app = app || this.req.app;

    var paths = req.url.split("/");
    this.collectionName = paths[1];
};

LJSRequest.prototype.schemeAndAuthority = function() {
    return this.req.protocol + '://' + this.req.get('Host');
};

LJSRequest.prototype.baseUrl = function() {
    return this.schemeAndAuthority() + this.app.get('restApiRoot');
};

module.exports = LJSRequest;