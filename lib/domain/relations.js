var logger = require('../support/logger');
var models = require('./models');

var Relations =  function(app) {
    this.app = app;
    this.pendingRelations = {};
};

Relations.prototype.bindRelation = function bindRelation(schema, modelClass) {
    if (schema.relations) {
        bindRelations.call(this, schema.collectionName, modelClass, schema.relations);
    }
    bindPendingRelations.call(this, schema.collectionName, modelClass);
};


function bindRelations(targetCollectionName, targetModel, relations) {
    var relation;
    var collectionName;
    var relationModel;

    for (var relationKey in relations) {
        relation = relations[relationKey];
        relationModel = models.fromPluralModelName(this.app, relation.collectionName);

        if (!relationModel) {
            logger.info('[bindRelation] collectionName: "'+relation.collectionName+'" not found, storing as pending relation');
            pushPendingRelation.call(this, targetCollectionName, relation.collectionName, relationKey, relation);
            return;
        }

        makeAssociation(targetModel, relationModel, relationKey, relation);
    }
}

function bindPendingRelations(relationCollectionName, relationModel) {
    var pendingRelations = this.pendingRelations[relationCollectionName];
    var pendingRelation;
    var targetModel;
    var relation;

    if (!pendingRelations){
        return;
    }

    for (var i=0; i<pendingRelations.length; i++) {
        pendingRelation = pendingRelations[i];
        relation = pendingRelation.relation;
        targetModel = models.fromPluralModelName(this.app, pendingRelation.targetCollectionName);

        logger.info('[bindRelation] binding a pending relation:', pendingRelation.targetCollectionName, relation.type, relationCollectionName);
        makeAssociation(targetModel, relationModel, pendingRelation.relationKey, relation);
    }
};


function makeAssociation(targetModel, relationModel, relationKey, relation) {
    if (relation.type == 'belongsTo') {
        targetModel.belongsTo(relationModel, {as: relationKey, foreignKey: relation.foreignKey});
    } else if (relation.type == 'hasMany') {
        targetModel.hasMany(relationModel, {as: relationKey, foreignKey: relation.foreignKey});
    }
}

function pushPendingRelation(targetCollectionName, relationCollectionName, relationKey, relation) {
    if (!this.pendingRelations[relationCollectionName]) {
        this.pendingRelations[relationCollectionName] = [];
    }

    this.pendingRelations[relationCollectionName].push({
        relationKey: relationKey,
        targetCollectionName: targetCollectionName,
        relation: relation
    });
}

module.exports = Relations;
