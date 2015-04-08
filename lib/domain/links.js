function Links(defaultLinks, relationLinks, customLinks) {
    this.defaultLinks = defaultLinks;
    this.relationLinks = relationLinks || [];
    this.customLinks = customLinks || [];
}

Links.prototype.all = function() {
    var customLinks = this.custom();
    var relationLinks = this.relations();

    return this.defaultLinks.concat(relationLinks).concat(customLinks);
};

Links.prototype.relations = function() {
    return relationLinksNotOverridingDefaultLinks.call(this, this.relationLinks);
};

Links.prototype.custom = function() {
    return customLinksNotOverridingDefaultLinks.call(this, this.customLinks);
};

function customLinksNotOverridingDefaultLinks(links) {
    var defaultRels = [];
    var i;

    for (i = 0; i < this.defaultLinks.length; i++) {
        defaultRels.push(this.defaultLinks[i].rel);
    }

    for (i = 0; i < this.relationLinks.length; i++) {
        defaultRels.push(this.relationLinks[i].rel);
    }

    var customLinks = links || [];
    customLinks = customLinks.filter(function(link) {
        return defaultRels.indexOf(link.rel) === -1;
    });

    return customLinks;
}

function relationLinksNotOverridingDefaultLinks(links) {
    var defaultRels = this.defaultLinks.map(function(link) {
        return link.rel;
    });

    var customLinks = links || [];
    customLinks = customLinks.filter(function(link) {
        return defaultRels.indexOf(link.rel) === -1;
    });

    return customLinks;
}

module.exports = Links;
