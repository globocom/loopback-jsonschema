require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var RegistryModels = require('../../../lib/domain/registry-models');

describe('RegistryModels', function() {
  var registryModels;

  beforeEach(function() {
    registryModels = new RegistryModels;
  });

  describe('#appendModelV1', function() {
    var model = {collectionName: 'my-collection'};

    beforeEach(function() {
      registryModels.appendModelV1('my-collection', model);
    });

    it('should add model to V1 map', function() {
      expect(registryModels.v1Models.hasOwnProperty('my-collection')).to.be.true;
      expect(registryModels.v1Models['my-collection']).to.eql(model);
    });

    it('should not overwrite an existing V1 map item', function() {
      registryModels.appendModelV1('my-collection', {collectionName: 'new-collection'});
      expect(registryModels.v1Models['my-collection']).to.eql(model);
    });
  });

  describe('#appendModelV2', function() {
    var model = {collectionName: 'my-collection', tenantId: 'my-tenant'};

    beforeEach(function() {
      registryModels.appendModelV2('my-collection', 'my-tenant', model);
    });

    it('should add model to V2 map', function() {
      expect(registryModels.v2Models.hasOwnProperty('my-collection')).to.be.true;
      expect(registryModels.v2Models['my-collection'].hasOwnProperty('my-tenant')).to.be.true;
      expect(registryModels.v2Models['my-collection']['my-tenant']).to.eql(model);
    });

    it('should not overwrite an existing V2 map item', function() {
      registryModels.appendModelV1('my-collection', {collectionName: 'new-collection', tenantId: 'new-tenant'});
      expect(registryModels.v2Models['my-collection']['my-tenant']).to.eql(model);
    });
  });
});
