var LJSRequest = function(req) {
    this.req = req;
    this.body = req.body;
};

LJSRequest.prototype.schemeAndAuthority = function() {
    return this.req.protocol + '://' + this.req.get('Host');
};

LJSRequest.prototype.baseUrl = function() {
    return this.schemeAndAuthority() + this.req.app.get('restApiRoot');
};

module.exports = LJSRequest;