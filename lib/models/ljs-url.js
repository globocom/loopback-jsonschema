var parse = require('url').parse;

function LJSUrl(url) {
    this.url = url;
    var fragments = parse(this.url)['path'].split("/");
    this.restApiRoot    = fragments[1];
    this.collectionName = fragments[2];
    this.resourceId     = fragments[3];
};

LJSUrl.buildFromModel = function(ljsReq, instance) {
    var model = instance.constructor;
    var url = fromCollectionName(ljsReq, model.pluralModelName) + '/' + instance.id;
    return new LJSUrl(url);
};

LJSUrl.buildFromCollectionName = function(ljsReq, collectionName) {
    return new LJSUrl(fromCollectionName(ljsReq, collectionName));
};

LJSUrl.prototype.isCollection = function(ljsReq, instance) {
    return !this.resourceId;
};

function fromCollectionName(ljsReq, collectionName) {
    return ljsReq.baseUrl() + '/' + collectionName;
};

module.exports = LJSUrl;