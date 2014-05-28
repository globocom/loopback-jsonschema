function Links(defaultLinks, customLinks) {
    this.defaultLinks = defaultLinks;
    this.customLinks = customLinks || [];
};

Links.prototype.all = function() {
    var customLinks = this.custom();
    return this.defaultLinks.concat(customLinks);
};

Links.prototype.custom = function() {
    return customLinksNotOverridingDefaultLinks.call(this, this.customLinks);
};

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
