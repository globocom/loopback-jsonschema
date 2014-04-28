var LJSRequest = function(req) {
    this.req = req;
    this.body = req.body;
};

LJSRequest.prototype.schemeAndAuthority = function() {
    return this.req.protocol + '://' + this.req.get('Host');
};

module.exports = LJSRequest;