'use strict';

let registryModelsInstance;

class RegistryModels {
  constructor() {
    if(!registryModelsInstance) {
      registryModelsInstance = this;
    }

    this.reset();
    return registryModelsInstance;
  }

  reset() {
    this.v1Models = {};
    this.v2Models = {};
  }

  appendModelV1(collectionName, model) {
    if(!this.v1Models.hasOwnProperty(collectionName)) {
      this.v1Models[collectionName] = model;
    }
  }

  appendModelV2(collectionName, tenantId, model) {
    if(!this.v2Models.hasOwnProperty(collectionName)) {
      this.v2Models[collectionName] = {};
      this.v2Models[collectionName][tenantId] = model;
    }
  }

  findV1(collectionName) {
    if(this.v1Models.hasOwnProperty(collectionName)) {
      return this.v1Models[collectionName];
    }

    return;
  }

  findV2(tenantId, collectionName) {
    if(this.v2Models.hasOwnProperty(collectionName)) {
        if(!this.v2Models[collectionName].hasOwnProperty(tenantId)) {
            tenantId = 'default';
        }

        return this.v2Models[collectionName][tenantId];
    }

    return;
  }
}

module.exports = RegistryModels;
