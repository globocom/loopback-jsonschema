module.exports = {
    $schema: "http://json-schema.org/draft-04/hyper-schema#",
    type: "object",
    properties: {
        relations: {
            type: "object",
            patternProperties: {
                "[a-z]+": {
                    type: "object",
                    properties: {
                        collectionName: {
                            type: "string"
                        },
                        type: {
                            type: "string",
                            "enum": [
                                "belongsTo",
                                "hasMany"
                            ]
                        },
                        foreignKey: {
                            type: "string"
                        }
                    },
                    required: ["collectionName", "type", "foreignKey"],
                    additionalProperties: false
                }
            }
        }
    }

};
