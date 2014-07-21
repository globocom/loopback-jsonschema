var parse = require('url').parse;

var CollectionSchema = require('../domain/collection-schema');
var config = require('../support/config');
var ItemSchema = require('../domain/item-schema');
var logger = require('../support/logger');

function LJSUrl(url) {
    this.url = url;
    try {
        var parsedUrl = parse(this.url);
        var fragments = parsedUrl.pathname.split('/');
        this.host = parsedUrl.host;
        this.restApiRoot    = fragments[1];
        this.collectionName = fragments[2];
        this.resourceId     = fragments[3];
    } catch(e) {
        if (e instanceof TypeError) {
            logger.info('Invalid URL:', url, e);
        } else {
            throw e;
        }
    }
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

