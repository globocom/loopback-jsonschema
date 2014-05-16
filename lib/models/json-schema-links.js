function JsonSchemaLinks(ljsReq) {
    this.ljsReq = ljsReq;

    this.defaultLinks = [
        {rel: 'self', href: null },
        {rel: 'item', href: null },
        {rel: 'update', method: 'PUT', href: null },
        {rel: 'delete', method: 'DELETE', href: null }
    ];
};

JsonSchemaLinks.prototype.onRequest = function() {
    var customLinks = selectCustomLinks.call(this, this.ljsReq.body.links);

    this.ljsReq.body.links = customLinks;
};

JsonSchemaLinks.prototype.onResponse = function(result) {
    if (result && result.collectionName) {
        var defaultLinks = selectDefaultLinks.call(this, result.collectionName);
        var customLinks = selectCustomLinks.call(this, result.links);

        customLinks = completeCustomRelativeUrlsWithBaseUrl.call(this, customLinks);

        result.links = this.defaultLinks.concat(customLinks);
    }
};

function selectDefaultLinks(collectionName) {
    var baseUrl = this.ljsReq.baseUrl();
    var entityPath = fetchEntityPath.call(this, collectionName);

    this.defaultLinks.forEach(function(defaultLink) {
        defaultLink.href = baseUrl + entityPath;
    });

    return this.defaultLinks;
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

function fetchEntityPath(collectionName) {
    return '/' + collectionName + '/{id}';
};

module.exports = JsonSchemaLinks;
