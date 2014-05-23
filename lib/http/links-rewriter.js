var parseUrl = require('url').parse;
var traverse = require('traverse');

var linksRewriter = module.exports = {
    makeAbsolute: function(ljsReq, links) {
        var baseUrl = ljsReq.baseUrl();

        traverse(links).forEach(function(property) {
            if (this.key === 'href' || this.key === '$ref') {
                if (isRelative(property)) {
                    this.update(baseUrl + property);
                }
            }
        });
    }
};

function isRelative(url) {
    return !parseUrl(url).host;
};
