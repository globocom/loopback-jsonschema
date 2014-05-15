module.exports = jsonSchemaRoutes = {};

jsonSchemaRoutes.draw = function(app) {

    app.get(app.get('restApiRoot') + "/collection-schemas/:schema_id" , function(req, res){
        var schema = {
            $schema: 'http://json-schema.org/draft-04/hyper-schema#',
            title: 'Title',
            type: 'object',
            properties: {}
        };

        res.json(schema);
    });

}