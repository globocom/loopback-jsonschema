var parse = require('url').parse;
var CollectionSchema = require('../domain/collection-schema');

function LJSUrl(url) {
    this.url = url;
    var fragments = parse(this.url)['pathname'].split("/");
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

LJSUrl.prototype.isCollection = function() {
    return !this.resourceId;
};

LJSUrl.prototype.isSchema = function() {
    // TODO: Declaring this at the top of the module throws bizarre errors in tests.
    var ItemSchema = require('../domain/item-schema');

    return this.collectionName === ItemSchema.pluralModelName ||
        this.collectionName === CollectionSchema.pluralModelName;
};

function fromCollectionName(ljsReq, collectionName) {
    return ljsReq.baseUrl() + '/' + collectionName;
};

module.exports = LJSUrl;

