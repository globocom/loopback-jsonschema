var LJSRequest = require('./ljs-request');

module.exports = function locationHeaderCorrelator(ctx) {
    var fullUrl = new LJSRequest(ctx.req, ctx.req.app).fullUrl();
    var result  = ctx.result;
    var url;

    if (result) {
        var idName = result.constructor.getIdName();
        var id = result[idName];

        if (fullUrl.indexOf('/', fullUrl.length - 1) !== -1) {
            url = fullUrl + id;
        } else {
            url = fullUrl + '/' + id;
        }

        ctx.res.set('Location', url);
        ctx.res.status(201);
    }
};
