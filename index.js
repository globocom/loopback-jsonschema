module.exports = loopbackJsonSchema;

var JsonSchema = require('./models/json-schema');

function loopbackJsonSchema(app) {
    app.model(JsonSchema);
}
