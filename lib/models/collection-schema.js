var debug = require('debug')('json-schema');

var loopback = require('loopback');
var Model = require('loopback').Model;

var logger = require('../support/logger')
var JsonSchema = require('../../lib/models/json-schema');
var LJSRequest = require('../../lib/models/ljs-request');
var LJSUrl = require('../../lib/models/ljs-url');

function CollectionSchema(ljsReq, schemaId) {
    this.schemaId = schemaId;
    this.ljsReq = ljsReq;
};

CollectionSchema.prototype.data = function(callback) {
    var self = this;

    findBySchemaId(this.schemaId, function(err, itemSchema){
        var schema;

        if (itemSchema) {
            var ljsUrl = LJSUrl.build(self.ljsReq, itemSchema);

            schema = {
                $schema: itemSchema.$schema,
                title: itemSchema.collectionTitle,
                type: 'array',
                items: {
                    $ref: ljsUrl.url()
                }
            };
        }

        callback(err, schema);
    });
};

function findBySchemaId(schemaId, callback) {
    JsonSchema.findById(schemaId, function(err, itemSchema){
        if (err) {
            logger.error("Error fetching ItemSchema for schemaId:", schemaId, "Error:", err);
        } else if (itemSchema === null) {
            logger.info("Item Schema for schemaId", schemaId, "not found.");
        }
        callback(err, itemSchema);
    });
};

module.exports = CollectionSchema;