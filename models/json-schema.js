var loopback = require('loopback');
var loopbackExplorer = require('loopback-explorer');
var db = loopback.memory('db');


var JsonSchema = module.exports = db.createModel('json-schema');

JsonSchema.on('attached', function(app) {
    JsonSchema.afterSave = function(done) {
        var JsonSchemaModel = db.createModel(this.title);
        app.model(JsonSchemaModel);
        loopbackExplorer(app);
        done();
    }
});
