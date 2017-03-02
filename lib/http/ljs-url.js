var parse = require("fast-url-parser").parse;

var CollectionSchema = require('../domain/collection-schema');
var config = require('../support/config');
var ItemSchema = require('../domain/item-schema');
var logger = require('../support/logger');

function LJSUrl(url) {
    this.url = url;
    try {
        var parsedUrl = parse(this.url);
        this.urlFragments = parsedUrl.pathname.split('/');
        this.protocol = parsedUrl.protocol;
        this.host = parsedUrl.host;

        this.restApiRoot    = this.urlFragments[1];
        this.collectionName = this.urlFragments[2];
        this.resourceId     = this.urlFragments[3];
    } catch(e) {
        if (e instanceof TypeError) {
            logger.error('Invalid URL:', url, 'Stack:', e.stack);
        } else {
            throw e;
        }
    }
}

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
    return (!this.protocol && !this.host && !isUriTemplate(this.url));
};

LJSUrl.prototype.isV2 = function() {
  return this.urlFragments && this.urlFragments[2] === 'v2';
};

function isUriTemplate(url) {
    return url.charAt(0) === '{';
}

module.exports = LJSUrl;
