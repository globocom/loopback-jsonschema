function LJSUrl(url) {
    this.url = url;
};

LJSUrl.buildFromModel = function(ljsReq, instance) {
    var model = instance.constructor;
    var url = ljsReq.baseUrl() + '/' + model.pluralModelName + '/' + instance.id;

    return new LJSUrl(url);
};

module.exports = LJSUrl;