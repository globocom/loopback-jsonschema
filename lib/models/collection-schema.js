var debug = require('debug')('json-schema');

var loopback = require('loopback');
var Model = require('loopback').Model;

var logger = require('../support/logger')
var JsonSchema = require('../../lib/models/json-schema');

var CollectionSchema = function(schemaId) {
    this.schemaId = schemaId;
};

CollectionSchema.prototype.data = function(callback) {

    findBySchemaId(this.schemaId, function(err, itemSchema){
        callback(err, itemSchema);
    });
    // return {
    //     $schema: 'http://json-schema.org/draft-04/hyper-schema#',
    //     title: this.title,
    //     type: 'object',
    //     properties: {
    //         items: {
    //             type: 'array',
    //             items: {
    //                 $ref: this.itemSchemaUrl
    //             }
    //         }
    //     },
    //     required: ['items']
    // }
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
}

module.exports = CollectionSchema;