require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var Relations = require('../../../lib/domain/relations');
var models = require('../../../lib/domain/models');

describe('Relations', function(){
    var relations, schema, modelClass, targetModelClass;

    describe('.bindRelation', function(){
        describe('when not have a pending models to make association', function(){
            describe('when it\'s a belongsTo relation', function(){
                beforeEach(function() {
                    relations = new Relations();
                    modelClass = {
                        modelName: 'originModel',
                        belongsTo: this.sinon.spy()
                    };
                    schema = {
                        collectionName: 'model',
                        relations: {
                            target: {
                                collectionName: 'targetModel',
                                type: 'belongsTo',
                                foreignKey: 'myId'
                            }
                        }
                    };

                    targetModelClass = {
                        modelName: 'targetModel',
                        belongsTo: this.sinon.spy()
                    };

                    this.sinon.stub(models, 'fromPluralModelName', function(app, modelName) {
                        if (modelName == 'targetModel') {
                            return targetModelClass;
                        }
                    });

                    relations.bindRelation(schema, modelClass);
                });

                it('successfully bind a relation', function(){
                    expect(modelClass.belongsTo).to.have.been.calledWith(targetModelClass, {
                        as: 'target', foreignKey: 'myId'});
                });
            });
            describe('when it\'s a hasMany relation', function(){
                beforeEach(function() {
                    relations = new Relations();
                    modelClass = {
                        modelName: 'originModel',
                        hasMany: this.sinon.spy()
                    };
                    schema = {
                        collectionName: 'model',
                        relations: {
                            target: {
                                collectionName: 'targetModel',
                                type: 'hasMany',
                                foreignKey: 'myId'
                            }
                        }
                    };

                    targetModelClass = {
                        modelName: 'targetModel'
                    };

                    this.sinon.stub(models, 'fromPluralModelName', function(app, modelName) {
                        if (modelName == 'targetModel') {
                            return targetModelClass;
                        }
                    });

                    relations.bindRelation(schema, modelClass);
                });

                it('successfully bind a relation', function(){
                    expect(modelClass.hasMany).to.have.been.calledWith(targetModelClass, {
                        as: 'target', foreignKey: 'myId'});
                });
            });
        });

        describe('when have a pending models to make association', function(){
            describe('when it\'s a belongsTo relation', function(){
                beforeEach(function() {
                    relations = new Relations();
                    modelClass = {
                        modelName: 'originModel',
                        belongsTo: this.sinon.spy()
                    };
                    schema = {
                        collectionName: 'originModel',
                        relations: {
                            target: {
                                collectionName: 'targetModel',
                                type: 'belongsTo',
                                foreignKey: 'myId'
                            }
                        }
                    };

                    targetModelClass = {
                        modelName: 'targetModel',
                        belongsTo: this.sinon.spy()
                    };

                    this.sinon.stub(models, 'fromPluralModelName', function(app, modelName) {
                        if (modelName == 'originModel') {
                            return modelClass;
                        }
                    });

                    relations.bindRelation(schema, modelClass);
                });

                it('unsuccessfully bind a relation', function(){
                    expect(modelClass.belongsTo).to.have.not.been.called;
                });

                it('store a pending relation', function(){
                    expect(relations.pendingRelations).to.be.eql({
                        targetModel: [
                            {
                                relation: {
                                    collectionName: 'targetModel',
                                    type: 'belongsTo',
                                    foreignKey: 'myId'
                                },
                                relationKey: 'target',
                                targetCollectionName: 'originModel'
                            }
                        ]
                    });
                });

                describe('when a target schema was registred', function(){
                    beforeEach(function() {
                        var targetSchema = {
                            collectionName: 'targetModel'
                        };

                        relations.bindRelation(targetSchema, targetModelClass);
                    });

                    it('successfully bind a pending relation', function(){
                         expect(modelClass.belongsTo).to.have.been.calledWith(targetModelClass, {
                             as: 'target', foreignKey: 'myId'});
                    });
                });
            });
            describe('when it\'s a hasMany relation', function(){
                beforeEach(function() {
                    relations = new Relations();
                    modelClass = {
                        modelName: 'originModel',
                        hasMany: this.sinon.spy()
                    };
                    schema = {
                        collectionName: 'originModel',
                        relations: {
                            targets: {
                                collectionName: 'targetModel',
                                type: 'hasMany',
                                foreignKey: 'myId'
                            }
                        }
                    };

                    targetModelClass = {
                        modelName: 'targetModel',
                        belongsTo: this.sinon.spy()
                    };

                    this.sinon.stub(models, 'fromPluralModelName', function(app, modelName) {
                        if (modelName == 'originModel') {
                            return modelClass;
                        }
                    });

                    relations.bindRelation(schema, modelClass);
                });

                it('unsuccessfully bind a relation', function(){
                    expect(modelClass.hasMany).to.have.not.been.called;
                });

                it('store a pending relation', function(){
                    expect(relations.pendingRelations).to.be.eql({
                        targetModel: [
                            {
                                relation: {
                                    collectionName: 'targetModel',
                                    type: 'hasMany',
                                    foreignKey: 'myId'
                                },
                                relationKey: 'targets',
                                targetCollectionName: 'originModel'
                            }
                        ]
                    });
                });

                describe('when a target schema was registred', function(){
                    beforeEach(function() {
                        var targetSchema = {
                            collectionName: 'targetModel'
                        };

                        relations.bindRelation(targetSchema, targetModelClass);
                    });

                    it('successfully bind a pending relation', function(){
                         expect(modelClass.hasMany).to.have.been.calledWith(targetModelClass, {
                             as: 'targets', foreignKey: 'myId'});
                    });
                });

            });
        });

    });
});
