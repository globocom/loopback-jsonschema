var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var loopback = require('loopback');
var traverse = require('traverse');

var logger = require('../support/logger');

var RegistryModels = require('./registry-models');

var Relations = function(app) {
    this.app = app;
    this.pendingRelations = {};
    this.afterRemoteHooks = {};
    this.beforeRemoteHooks = {};
    this.boundRemoteHooks = {};
};

Relations.init = function(app) {
    Relations._instance = new Relations(app);
    return Relations._instance;
};

Relations.getInstance = function() {
    return Relations._instance;
};

inherits(Relations, EventEmitter);

Relations.prototype.bindAfterRemoteHook = function(relationType, methodName, hook) {
    var path = [relationType, methodName];

    if (!traverse(this.afterRemoteHooks).has(path)) {
        traverse(this.afterRemoteHooks).set(path, []);
    }

    this.afterRemoteHooks[relationType][methodName].push(hook);
};

Relations.prototype.bindBeforeRemoteHook = function(relationType, methodName, hook) {
    var path = [relationType, methodName];

    if (!traverse(this.beforeRemoteHooks).has(path)) {
        traverse(this.beforeRemoteHooks).set(path, []);
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

    var registryModels = new RegistryModels;

    for (var relationKey in relations) {
        relation = relations[relationKey];
        collectionName = relation.collectionName;

        if(fromModel.isV2) {
            var tenantId = fromModel.__tenantId;

            if(registryModels.v2Models.hasOwnProperty(collectionName)) {
                if(!registryModels.v2Models[collectionName].hasOwnProperty(tenantId)) {
                    tenantId = 'default';
                }

                toModel = registryModels.v2Models[collectionName][tenantId];
            }
        } else {
            toModel = registryModels.v1Models[collectionName];
        }

        if (!toModel) {
            logger.debug('[bindRelation] collectionName: "'+collectionName+'" not found, storing as pending relation');
            pushPendingRelation.call(this, fromCollectionName, collectionName, relationKey, relation);
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
        targetModel = loopback.findModel(pendingRelation.targetCollectionName);

        if (!targetModel) {
            logger.warn('[bindRelation] binding a pending relation failed: "'+pendingRelation.targetCollectionName+'" collectionName not found');
            continue;
        }

        logger.debug('[bindRelation] binding a pending relation:', pendingRelation.targetCollectionName, relation.type, fromCollectionName);
        makeAssociation.call(this, targetModel, fromModel, pendingRelation.relationKey, relation);
    }
};

function makeAssociation(fromModel, toModel, relationKey, relation) {
    var definition;

    if (relation.type == 'belongsTo') {
        definition = fromModel.belongsTo(toModel, {as: relationKey, foreignKey: relation.foreignKey});
    } else if (relation.type == 'hasMany') {
        definition = fromModel.hasMany(toModel, {as: relationKey, foreignKey: relation.foreignKey});
    }

    this.emit('association', relation.type, definition);

    bindAssociationHooks.call(this, fromModel, toModel, relationKey, relation);
}

function bindAssociationHooks(fromModel, toModel, relationKey, relation) {
    var hooks, hookI, methods, hookName, methodName, hookMethodName, hook;

    var relationCtx = {
        fromModelName: fromModel.modelName,
        fromPluralModelName: fromModel.pluralModelName,
        toModelName: toModel.modelName,
        toPluralModelName: toModel.pluralModelName,
        relation: relation
    };

    methods = this.beforeRemoteHooks[relation.type];
    for (methodName in methods) {
        hooks = methods[methodName];

        for (hookI=0; hookI<hooks.length; hookI++) {
            hookMethodName = 'prototype.__'+methodName+'__'+relationKey;
            hook = hooks[hookI];
            hookName = hook.name;

            if (!isAlreadyBoundHook.call(this, fromModel.modelName, hookMethodName, hookName)) {
                fromModel.beforeRemote(hookMethodName, hook.bind(null, relationCtx));
                setBoundHook.call(this, fromModel.modelName, hookMethodName, hookName);
            }
        }
    }

    methods = this.afterRemoteHooks[relation.type];
    for (methodName in methods) {
        hooks = methods[methodName];

        for (hookI=0; hookI<hooks.length; hookI++) {
            hookMethodName = 'prototype.__'+methodName+'__'+relationKey;
            hook = hooks[hookI];
            hookName = hook.name;

            if (!isAlreadyBoundHook.call(this, fromModel.modelName, hookMethodName, hookName)) {
                fromModel.afterRemote(hookMethodName, hook.bind(null, relationCtx));
                setBoundHook.call(this, fromModel.modelName, hookMethodName, hookName);
            }
        }
    }
}

function isAlreadyBoundHook(modelName, hookMethodName, hookName) {
    if (!this.boundRemoteHooks[modelName] || !this.boundRemoteHooks[modelName][hookMethodName]) {
        return false;
    }

    return this.boundRemoteHooks[modelName][hookMethodName].indexOf(hookName) > -1;
}

function setBoundHook(modelName, hookMethodName, hookName) {
    if (!this.boundRemoteHooks[modelName]) {
        this.boundRemoteHooks[modelName] = {};
    }

    if (!this.boundRemoteHooks[modelName][hookMethodName]) {
        this.boundRemoteHooks[modelName][hookMethodName] = [];
    }

    this.boundRemoteHooks[modelName][hookMethodName].push(hookName);
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
