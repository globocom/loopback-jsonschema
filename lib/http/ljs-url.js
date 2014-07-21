var parse = require('url').parse;

var CollectionSchema = require('../domain/collection-schema');
var config = require('../support/config');
var ItemSchema = require('../domain/item-schema');

function LJSUrl(url) {
    this.url = url;
    var parsedUrl = parse(this.url);
    this.host = parsedUrl.host;
    var fragments = parsedUrl.pathname.split('/');
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

LJSUrl.prototype.isInstance = function() {
    return !this.isSchema() && this.collectionName !== 'swagger';
};

LJSUrl.prototype.isCollection = function() {
    return !this.resourceId;
};

LJSUrl.prototype.isSchema = function() {
    return this.collectionName === ItemSchema.pluralModelName ||
        this.collectionName === config.CollectionSchemaClass.pluralModelName;
};

LJSUrl.prototype.isRelative = function() {
    return !this.host;
};

function fromCollectionName(ljsReq, collectionName) {
    return ljsReq.baseUrl() + '/' + collectionName;
};

module.exports = LJSUrl;

