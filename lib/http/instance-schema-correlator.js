var instanceSchemaCorrelator = module.exports = {
    correlate: function(itemSchema, ljsReq, res) {
        var schema = itemSchema;
        var ljsUrl = ljsReq.ljsUrl();

        if (ljsUrl.isCollection() && ljsReq.method === 'GET') {
            schema = itemSchema.collectionSchema();
        }

        var schemaUrl = ljsReq.baseUrl() + schema.url();

        res.set('Content-Type', 'application/json; charset=utf-8; profile=' + schemaUrl);
        res.set('Link', '<' + schemaUrl + '>; rel=describedby');
    }
};
