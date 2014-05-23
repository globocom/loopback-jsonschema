function Links(defaultLinks, customLinks) {
    this.defaultLinks = defaultLinks;
    this.customLinks = customLinks || [];
};

Links.prototype.all = function() {
    var customLinks = customLinksNotOverridingDefaultLinks.call(this, this.customLinks);
    return this.defaultLinks.concat(customLinks);
}

function customLinksNotOverridingDefaultLinks(links) {
    var defaultRels = this.defaultLinks.map(function(link) {
        return link.rel;
    });

    var customLinks = links || [];
    customLinks = customLinks.filter(function(link) {
        return defaultRels.indexOf(link.rel) === -1;
    });

    return customLinks;
};

module.exports = Links;
