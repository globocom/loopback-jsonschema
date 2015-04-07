var logger = require('../support/logger');
var models = require('./models');

var Relations =  function(app) {
    this.app = app;
    this.pendingRelations = {};
    this.afterRemoteHooks = {};
    this.beforeRemoteHooks = {};
    this.boundRemoteHooks = {};
};

Relations.prototype.bindAfterRemoteHook = function(relationType, methodName, hook) {
    if (!this.afterRemoteHooks[relationType]) {
        this.afterRemoteHooks[relationType] = {};
    }

    if (!this.afterRemoteHooks[relationType][methodName]) {
        this.afterRemoteHooks[relationType][methodName] = [];
    }

    this.afterRemoteHooks[relationType][methodName].push(hook);
};

Relations.prototype.bindBeforeRemoteHook = function(relationType, methodName, hook) {
    if (!this.beforeRemoteHooks[relationType]) {
        this.beforeRemoteHooks[relationType] = {};
    }

    if (!this.beforeRemoteHooks[relationType][methodName]) {
        this.beforeRemoteHooks[relationType][methodName] = [];
    }

    this.beforeRemoteHooks[relationType][methodName].push(hook);
};

Relations.prototype.bindRelation = function bindRelation(schema, modelClass) {
    if (schema.relations) {
        bindRelations.call(this, schema.collectionName, modelClass, schema.relations);
    }
    bindPendingRelations.call(this, schema.collectionName, modelClass);
};


function bindRelations(fromCollectionName, fromModel, relations) {
    var relation;
    var collectionName;
    var toModel;

    for (var relationKey in relations) {
        relation = relations[relationKey];
        toModel = models.fromPluralModelName(this.app, relation.collectionName);

        if (!toModel) {
            logger.info('[bindRelation] collectionName: "'+relation.collectionName+'" not found, storing as pending relation');
            pushPendingRelation.call(this, fromCollectionName, relation.collectionName, relationKey, relation);
            return;
        }

        makeAssociation.call(this, fromModel, toModel, relationKey, relation);
    }
}

function bindPendingRelations(fromCollectionName, fromModel) {
    var pendingRelations = this.pendingRelations[fromCollectionName];
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

        if (!targetModel) {
            logger.warn('[bindRelation] binding a pending relation failed: "'+pendingRelation.targetCollectionName+'" collectionName not found');
            continue;
        }

        logger.info('[bindRelation] binding a pending relation:', pendingRelation.targetCollectionName, relation.type, fromCollectionName);
        makeAssociation.call(this, targetModel, fromModel, pendingRelation.relationKey, relation);
    }
};


function makeAssociation(fromModel, toModel, relationKey, relation) {
    if (relation.type == 'belongsTo') {
        fromModel.belongsTo(toModel, {as: relationKey, foreignKey: relation.foreignKey});
    } else if (relation.type == 'hasMany') {
        fromModel.hasMany(toModel, {as: relationKey, foreignKey: relation.foreignKey});
    }

    bindAssociationHooks.call(this, fromModel, toModel, relationKey, relation);
}

function bindAssociationHooks(fromModel, toModel, relationKey, relation) {
    var hookName, hooks, hookI, typeHooks, hookMethodName;
    typeHooks = this.beforeRemoteHooks[relation.type];

    var relationCtx = {
        fromModelName: fromModel.modelName,
        fromPluralModelName: fromModel.pluralModelName,
        toModelName: toModel.modelName,
        toPluralModelName: toModel.pluralModelName,
        relation: relation
    };

    for (hookName in typeHooks) {
        hooks = typeHooks[hookName];

        for (hookI=0; hookI<hooks.length; hookI++) {
            hookMethodName = 'prototype.__'+hookName+'__'+relationKey;
            if (!isAlreadyBoundHook.call(this, fromModel.modelName, hookMethodName)) {
                fromModel.beforeRemote(hookMethodName, hooks[hookI].bind(null, relationCtx));
                setBoundHook.call(this, fromModel.modelName, hookMethodName);
            }
        }
    }

    typeHooks = this.afterRemoteHooks[relation.type];
    for (hookName in typeHooks) {
        hooks = typeHooks[hookName];

        for (hookI=0; hookI<hooks.length; hookI++) {
            hookMethodName = 'prototype.__'+hookName+'__'+relationKey;
            if (!isAlreadyBoundHook.call(this, fromModel.modelName, hookMethodName)) {
                fromModel.afterRemote(hookMethodName, hooks[hookI].bind(null, relationCtx));
                setBoundHook.call(this, fromModel.modelName, hookMethodName);
            }
        }
    }
}

function isAlreadyBoundHook(modelName, hookMethodName) {
    if (!this.boundRemoteHooks[modelName]) {
        return false;
    }

    return !!this.boundRemoteHooks[modelName][hookMethodName];
}

function setBoundHook(modelName, hookMethodName) {
    if (!this.boundRemoteHooks[modelName]) {
        this.boundRemoteHooks[modelName] = {};
    }

    this.boundRemoteHooks[modelName][hookMethodName] = true;
}

function pushPendingRelation(fromCollectionName, toCollectionName, relationKey, relation) {
    if (!this.pendingRelations[toCollectionName]) {
        this.pendingRelations[toCollectionName] = [];
    }

    this.pendingRelations[toCollectionName].push({
        relationKey: relationKey,
        targetCollectionName: fromCollectionName,
        relation: relation
    });
}

module.exports = Relations;
