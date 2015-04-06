require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var Relations = require('../../../lib/domain/relations');
var models = require('../../../lib/domain/models');

describe('Relations', function(){
    var relations, schema, modelClass, targetModelClass;

    describe('.bindBeforeRemoteHook', function(){
        var fakeHook;
        beforeEach(function() {
            relations = new Relations();
            fakeHook = this.sinon.spy();
            relations.bindBeforeRemoteHook('hasMany', 'create', fakeHook);
        });

        it('should to bind the relation', function(){
            expect(relations.beforeRemoteHooks).to.be.eql({
                hasMany: {
                    create: [fakeHook]
                }
            });
        });
    });

    describe('.bindAfterRemoteHook', function(){
        var fakeHook;
        beforeEach(function() {
            relations = new Relations();
            fakeHook = this.sinon.spy();
            relations.bindAfterRemoteHook('hasMany', 'create', fakeHook);
        });

        it('should to bind the relation', function(){
            expect(relations.afterRemoteHooks).to.be.eql({
                hasMany: {
                    create: [fakeHook]
                }
            });
        });
    });

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

        describe('when calling `bindRelation` twice times', function(){
            var fakeHook;

            beforeEach(function() {
                fakeHook = this.sinon.spy();

                relations = new Relations();
                relations.bindAfterRemoteHook('belongsTo', 'create', fakeHook);

                modelClass = {
                    modelName: 'originModel',
                    belongsTo: this.sinon.spy(),
                    afterRemote: this.sinon.spy()
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
                relations.bindRelation(schema, modelClass);
            });

            it('should to store a bound relation', function(){
                expect(relations.boundRemoteHooks).to.be.eql({
                    originModel: {
                        "prototype.__create__target": true
                    }
                });
            });

            it('should to bind hook once time', function(){
                expect(modelClass.afterRemote).to.be.calledOnce;
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
