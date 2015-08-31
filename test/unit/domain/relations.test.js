require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var Relations = require('../../../lib/domain/relations');


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

                    this.sinon.stub(loopback, 'findModel', function(collectionName) {
                        if (collectionName == 'targetModel') {
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
                var eventListener, definitionStub;

                beforeEach(function() {
                    relations = new Relations();

                    eventListener = this.sinon.spy();
                    relations.on('association', eventListener);

                    modelClass = {
                        modelName: 'originModel',
                        hasMany: this.sinon.stub()
                    };
                    definitionStub = this.sinon.stub();
                    modelClass.hasMany.returns(definitionStub);

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

                    this.sinon.stub(loopback, 'findModel', function(collectionName) {
                        if (collectionName == 'targetModel') {
                            return targetModelClass;
                        }
                    });

                    relations.bindRelation(schema, modelClass);
                });

                it('successfully bind a relation', function(){
                    expect(modelClass.hasMany).to.have.been.calledWith(targetModelClass, {
                        as: 'target', foreignKey: 'myId'});
                });

                it('successfully emit a event', function(){
                    expect(eventListener).to.have.been.calledWith('hasMany', definitionStub);
                });
            });
        });

        describe('when two hooks are binded for a method', function(){
            var fakeHook1, fakeHook2, fakeHook1Called, fakeHook2Called;

            beforeEach(function() {
                fakeHook1Called = false;
                fakeHook2Called = false;

                fakeHook1 = function fakeHook1() {
                    fakeHook1Called = true;
                };

                fakeHook2 = function fakeHook2() {
                    fakeHook2Called = true;
                };

                relations = new Relations();
                relations.bindAfterRemoteHook('belongsTo', 'create', fakeHook1);
                relations.bindAfterRemoteHook('belongsTo', 'create', fakeHook2);

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

                this.sinon.stub(loopback, 'findModel', function(collectionName) {
                    if (collectionName == 'targetModel') {
                        return targetModelClass;
                    }
                });

                relations.bindRelation(schema, modelClass);
                relations.bindRelation(schema, modelClass);
            });

            it('should to store the relation bounds', function(){
                expect(relations.boundRemoteHooks).to.be.eql({
                    originModel: {
                        "prototype.__create__target": ['fakeHook1', 'fakeHook2']
                    }
                });
            });

            it('should to bind hooks', function(){
                expect(modelClass.afterRemote).to.be.calledTwice;
                expect(modelClass.afterRemote).to.be.calledWith('prototype.__create__target');
            });
        });


        describe('when calling `bindRelation` twice times', function(){
            var fakeHook;

            beforeEach(function() {
                fakeHook = function myHook() {};

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

                this.sinon.stub(loopback, 'findModel', function(collectionName) {
                    if (collectionName == 'targetModel') {
                        return targetModelClass;
                    }
                });

                relations.bindRelation(schema, modelClass);
                relations.bindRelation(schema, modelClass);
            });

            it('should to store a bound relation', function(){
                expect(relations.boundRemoteHooks).to.be.eql({
                    originModel: {
                        "prototype.__create__target": ['myHook']
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

                    this.sinon.stub(loopback, 'findModel', function(collectionName) {
                        if (collectionName == 'originModel') {
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

                    this.sinon.stub(loopback, 'findModel', function(collectionName) {
                        if (collectionName == 'originModel') {
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
