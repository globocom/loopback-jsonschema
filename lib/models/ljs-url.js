function LJSUrl(ljsReq, instance) {
    this.ljsReq = ljsReq;
    this.instance = instance;
    this.model = this.instance.constructor;
};

LJSUrl.prototype.url = function() {
    return this.ljsReq.baseUrl() + '/' + this.model.pluralModelName + '/' + this.instance.id;
}

LJSUrl.build = function(ljsReq, instance) {
    return new LJSUrl(ljsReq, instance);
};

module.exports = LJSUrl;