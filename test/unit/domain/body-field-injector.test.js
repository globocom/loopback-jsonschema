var expect = require('chai').expect;

var bodyFieldInjector = require('../../../lib/domain/body-field-injector');

describe('bodyFieldInjector', function() {
    var FakeModel;

    describe('when has a readOnly field', function(){
        it('should to remove property', function(){
            var model = {
                definition: {
                    properties: {
                        name: {type: String},
                        status: {readOnly: true, type: String}
                    }
                }
            };

            var ctx = {
                method: {
                    ctor: model
                },
                req: {
                    body: {name: 'wilson', status: 'top'}
                }
            };

            var body = bodyFieldInjector(ctx);
            expect(body).to.be.eql({
                name: 'wilson'
            });
        });
    });

    describe('when has a field with default value', function(){

        beforeEach(function() {
            FakeModel = {
                definition: {
                    properties: {
                        name: {type: String},
                        status: {default: 'default_status', type: String}
                    }
                }
            };
        });

        describe('when default value is applied', function() {
            it('should use the default value when property is not defined', function(){

                var ctx = {
                    method: {
                        ctor: FakeModel
                    },
                    req: {
                        body: {name: 'wilson'}
                    }
                };

                var body = bodyFieldInjector(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    status: 'default_status'
                });
            });

            it('should ignore the property with null value', function(){
                var ctx = {
                    method: {
                        ctor: FakeModel
                    },
                    req: {
                        body: {name: 'wilson', status: null}
                    }
                };

                var body = bodyFieldInjector(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    status: 'default_status'
                });
            });
        });

        describe('when default value is not applied', function() {
            it('should ignore the default value', function(){
                var ctx = {
                    method: {
                        ctor: FakeModel
                    },
                    req: {
                        body: {name: 'wilson', status: 'custom_status'}
                    }
                };

                var body = bodyFieldInjector(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    status: 'custom_status'
                });
            });

            it('should ignore the default value even for boolean types', function(){
                var model = {
                    definition: {
                        properties: {
                            name: {type: String},
                            active: {default: true, type: String}
                        }
                    }
                };

                var ctx = {
                    method: {
                        ctor: model
                    },
                    req: {
                        body: {name: 'wilson', active: false}
                    }
                };

                var body = bodyFieldInjector(ctx);

                expect(body).to.be.eql({
                    name: 'wilson',
                    active: false
                });
            });

            it('should ignore the default value even for number types', function(){
                var model = {
                    definition: {
                        properties: {
                            name: {type: String},
                            time: {default: 60, type: Number}
                        }
                    }
                };

                var ctx = {
                    method: {
                        ctor: model
                    },
                    req: {
                        body: {name: 'wilson', time: 0}
                    }
                };

                var body = bodyFieldInjector(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    time: 0
                });
            });
        });

    });
    describe('when has a readOnly field with default value', function(){
        it('should to replace property', function(){
            var model = {
                definition: {
                    properties: {
                        name: {type: String},
                        status: {readOnly: true, type: String, default: 'active'}
                    }
                }
            };

            var ctx = {
                method: {
                    ctor: model
                },
                req: {
                    body: {name: 'wilson', status: 'top'}
                }
            };

            var body = bodyFieldInjector(ctx);
            expect(body).to.be.eql({
                name: 'wilson',
                status: 'active'
            });
        });
    });
});
