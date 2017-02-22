'use strict';

let registryModelsInstance;

class RegistryModels {
  constructor() {
    if(!registryModelsInstance) {
      registryModelsInstance = this;
    }

    this.v1Models = {};
    this.v2Models = {};

    return registryModelsInstance;
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
}

module.exports = RegistryModels;
