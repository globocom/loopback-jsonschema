function makeCached(uncachedFn, cacheKeyFn) {
    var cache = {};

    function wrapper() {
        var cacheKey = cacheKeyFn.apply(this, arguments);
        if (!(cacheKey in cache)) {
            cache[cacheKey] = uncachedFn.apply(this, arguments);
        }
        return cache[cacheKey];
    }

    wrapper.flush = function() {
        cache = {};
    };

    return wrapper;
}

module.exports = makeCached;
