var LJSRequest = require('./ljs-request');

module.exports = function locationHeaderCorrelator(ctx) {
    var fullUrl = new LJSRequest(ctx.req, ctx.req.app).fullUrl();
    var result  = ctx.result;

    if (result) {
        var idName = result.constructor.getIdName();
        var url = fullUrl + '/' + result[idName];

        ctx.res.set('Location', url);
        ctx.res.status(201);
    }
};
