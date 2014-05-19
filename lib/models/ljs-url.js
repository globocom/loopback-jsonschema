var parse = require('url').parse;

function LJSUrl(url) {
    this.url = url;

    var fragments = parse(this.url)['path'].split("/");
    this.restApiRoot    = fragments[1];
    this.collectionName = fragments[2];
    this.resourceId     = fragments[3];
};

LJSUrl.prototype.isCollection = function(ljsReq, instance) {
    return !this.resourceId;
};

LJSUrl.buildFromModel = function(ljsReq, instance) {
    var model = instance.constructor;
    var url = ljsReq.baseUrl() + '/' + model.pluralModelName + '/' + instance.id;

    return new LJSUrl(url);
};

LJSUrl.buildFromRequest = function(ljsReq) {
    return new LJSUrl(ljsReq.fullUrl());
};

module.exports = LJSUrl;