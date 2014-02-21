module.exports = initLoopbackJsonSchema;

var JsonSchema = require('./models/json-schema');

function initLoopbackJsonSchema(app) {
    app.model(JsonSchema);
}
