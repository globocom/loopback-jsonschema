function JsonSchemaLinks(ljsReq, defaultLinks, customLinks) {
    this.ljsReq = ljsReq;
    this.defaultLinks = defaultLinks;
    this.customLinks = customLinks || [];
};

JsonSchemaLinks.prototype.all = function() {
    var customLinks = selectCustomLinks.call(this, this.customLinks);
    customLinks = completeCustomRelativeUrlsWithBaseUrl.call(this, customLinks);
    return this.defaultLinks.concat(customLinks);
}

JsonSchemaLinks.prototype.onRequest = function() {
    var customLinks = selectCustomLinks.call(this, this.ljsReq.body.links);
    this.ljsReq.body.links = customLinks;
};

function selectCustomLinks(links) {
    var defaultRels = this.defaultLinks.map(function(link) {
        return link.rel;
    });

    var customLinks = links || [];
    customLinks = customLinks.filter(function(link) {
        return defaultRels.indexOf(link.rel) === -1;
    });

    return customLinks;
};

function completeCustomRelativeUrlsWithBaseUrl(customLinks) {
    var baseUrl = this.ljsReq.baseUrl();

    customLinks.forEach(function(customLink) {
        if (customLink.href.indexOf("http") === -1) {
            customLink.href = baseUrl + customLink.href;
        }
    });

    return customLinks;
};

module.exports = JsonSchemaLinks;
