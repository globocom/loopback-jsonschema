var objectPath = require('object-path');
var parseUrl = require('url').parse;

var linksRewriter = module.exports = {
    makeAbsolute: function(ljsReq, links) {
        if (!links) { return; }

        var baseUrl = ljsReq.baseUrl();
        links.forEach(function(link) {
            if (isRelative(link, 'href')) {
                link.href = baseUrl + link.href;
            }
            if (isRelative(link, 'schema.$ref')) {
                link.schema.$ref = baseUrl + link.schema.$ref;
            }
        });
    }
};

function isRelative(link, path) {
    var url = objectPath.get(link, path);
    return url && !parseUrl(url).host;
};
