var expect = require('chai').expect;

var readOnlyDefaultValuesHandler = require('../../../lib/domain/readonly-default-values-handler');

describe('readOnlyDefaultValuesHandler', function() {
    var model;
    var ctx;

    describe('readOnly', function(){
        it('should remove property', function(){
            model = {
                definition: {
                    properties: {
                        name: {type: String},
                        status: {readOnly: true, type: String}
                    }
                }
            };

            ctx = {
                method: {
                    ctor: model
                },
                req: {
                    body: {name: 'wilson', status: 'single'}
                }
            };

            var body = readOnlyDefaultValuesHandler(ctx);
            expect(body).to.be.eql({
                name: 'wilson'
            });
        });

        describe('when schema has a array object of a one type', function(){
            beforeEach(function() {
                model = {
                    definition: {
                        properties: {
                            medias: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        path: {type: "string"},
                                        author: {type: "string", readOnly: true}
                                    }
                                }
                            }
                        }
                    }
                };

                ctx = {
                    method: {
                        ctor: model
                    },
                    req: {
                        body: {}
                    }
                };
            });

            it('should remove property', function(){
                ctx.req.body = {
                    medias: [
                        {path: '/user/tmp', author: 'wilson'},
                        {path: '/tmp/imgs', author: 'isa'}
                    ]
                };
                var body = readOnlyDefaultValuesHandler(ctx);

                expect(body).to.be.eql({
                    medias: [
                        {path: '/user/tmp'},
                        {path: '/tmp/imgs'}
                    ]
                });
            });

            it('should handle invalid payload', function(){
                ctx.req.body = {};
                var body = readOnlyDefaultValuesHandler(ctx);

                expect(body).to.be.eql({});
            });
        });

        describe('when schema has a nested objects', function(){
            beforeEach(function() {
                model = {
                    definition: {
                        properties: {
                            name: {type: String},
                            contact: {
                                type: 'object',
                                properties: {
                                    age: {type: Number},
                                    status: {readOnly: true, type: String}
                                }
                            }
                        }
                    }
                };

                ctx = {
                    method: {
                        ctor: model
                    },
                    req: {
                        body: {}
                    }
                };
            });

            it('should remove property', function(){
                ctx.req.body = {
                    name: 'wilson',
                    contact: {
                        status: 'single',
                        age: 12
                    }
                };
                var body = readOnlyDefaultValuesHandler(ctx);

                expect(body).to.be.eql({
                    name: 'wilson',
                    contact: {
                        age: 12
                    }
                });
            });

            it('should keep parent key', function(){
                ctx.req.body = {
                    name: 'wilson',
                    contact: {
                        status: 'single'
                    }
                };

                var body = readOnlyDefaultValuesHandler(ctx);

                expect(body).to.be.eql({
                    name: 'wilson',
                    contact: {}
                });
            });
        });
    });

    describe('default value', function(){
        beforeEach(function() {
            model = {
                definition: {
                    properties: {
                        name: {type: String},
                        status: {default: 'default_status', type: String}
                    }
                }
            };
        });

        describe('when schema has a array object of a one type', function(){
            beforeEach(function() {
                model = {
                    definition: {
                        properties: {
                            medias: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        path: {type: 'string'},
                                        author: {type: 'string', default: 'Paulo Coelho'}
                                    }
                                }
                            }
                        }
                    }
                };

                ctx = {
                    method: {
                        ctor: model
                    },
                    req: {
                        body: {}
                    }
                };
            });

            it('should apply default value', function(){
                ctx.req.body = {
                    medias: [
                        {path: '/user/tmp'},
                        {path: '/tmp/imgs'}
                    ]
                };
                var body = readOnlyDefaultValuesHandler(ctx);

                expect(body).to.be.eql({
                    medias: [
                        {path: '/user/tmp', author: 'Paulo Coelho'},
                        {path: '/tmp/imgs', author: 'Paulo Coelho'}
                    ]
                });
            });

            it('should handle invalid payload', function(){
                ctx.req.body = {};
                var body = readOnlyDefaultValuesHandler(ctx);

                expect(body).to.be.eql({});
            });
        });

        describe('when default value is applied', function() {
            it('should use the default value when property is not defined', function(){
                ctx = {
                    method: {
                        ctor: model
                    },
                    req: {
                        body: {name: 'wilson'}
                    }
                };

                var body = readOnlyDefaultValuesHandler(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    status: 'default_status'
                });
            });

            it('should not ignore property with null value', function(){
                ctx = {
                    method: {
                        ctor: model
                    },
                    req: {
                        body: {name: 'wilson', status: null}
                    }
                };

                var body = readOnlyDefaultValuesHandler(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    status: null
                });
            });
        });

        describe('when schema has nested objects', function(){
            beforeEach(function() {
                model = {
                    definition: {
                        properties: {
                            name: {type: String},
                            contact: {
                                type: 'object',
                                properties: {
                                    age: {type: Number},
                                    status: {default: 'active', type: String}
                                }
                            }
                        }
                    }
                };
            });

            it('should apply default value', function(){
                ctx = {
                    method: {
                        ctor: model
                    },
                    req: {
                        body: {
                            name: 'wilson',
                            contact: {
                                age: 12
                            }
                        }
                    }
                };

                var body = readOnlyDefaultValuesHandler(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    contact: {
                        status: "active",
                        age: 12
                    }
                });
            });


            it('should apply default value for nested object', function(){
                ctx = {
                    method: {
                        ctor: model
                    },
                    req: {
                        body: {
                            name: 'wilson'
                        }
                    }
                };

                var body = readOnlyDefaultValuesHandler(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    contact: {
                        status: "active"
                    }
                });
            });
        });

        describe('when default value is not applied', function() {
            it('should ignore the default value', function(){
                ctx = {
                    method: {
                        ctor: model
                    },
                    req: {
                        body: {name: 'wilson', status: 'custom_status'}
                    }
                };

                var body = readOnlyDefaultValuesHandler(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    status: 'custom_status'
                });
            });

            it('should ignore the default value even for boolean types', function(){
                model = {
                    definition: {
                        properties: {
                            name: {type: String},
                            active: {default: true, type: Boolean}
                        }
                    }
                };

                ctx = {
                    method: {
                        ctor: model
                    },
                    req: {
                        body: {name: 'wilson', active: false}
                    }
                };

                var body = readOnlyDefaultValuesHandler(ctx);

                expect(body).to.be.eql({
                    name: 'wilson',
                    active: false
                });
            });

            it('should ignore the default value even for number types', function(){
                model = {
                    definition: {
                        properties: {
                            name: {type: String},
                            time: {default: 60, type: Number}
                        }
                    }
                };

                ctx = {
                    method: {
                        ctor: model
                    },
                    req: {
                        body: {name: 'wilson', time: 0}
                    }
                };

                var body = readOnlyDefaultValuesHandler(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    time: 0
                });
            });
        });
    });

    describe('when the field is readOnly and has default value', function(){
        beforeEach(function(){
            ctx = {
                method: {
                    ctor: {}
                },
                req: {
                    body: {name: 'wilson', status: 'single'}
                }
            };
        });

        it('should not replace current value when readOnly is false', function(){
            ctx.method.ctor = {
                definition: {
                    properties: {
                        name: {type: String},
                        status: {readOnly: false, type: String, default: 'active'}
                    }
                }
            };

            var body = readOnlyDefaultValuesHandler(ctx);
            expect(body).to.be.eql({
                name: 'wilson',
                status: 'single'
            });

        });

        it('should replace current value with default value', function(){
            model = {
                definition: {
                    properties: {
                        name: {type: String},
                        status: {readOnly: true, type: String, default: 'active'}
                    }
                }
            };

            ctx = {
                method: {
                    ctor: model
                },
                req: {
                    body: {name: 'wilson', status: 'single'}
                }
            };

            var body = readOnlyDefaultValuesHandler(ctx);
            expect(body).to.be.eql({
                name: 'wilson',
                status: 'active'
            });
        });

        describe('when schema has a array object of a one type', function(){
            beforeEach(function() {
                model = {
                    definition: {
                        properties: {
                            telephones: {
                                type: "array",
                                items: [
                                    {
                                        type: "object",
                                        properties: {
                                            contact: {type: "string"},
                                            available: {type: "boolean", readOnly: true, default: true}
                                        }
                                    },
                                    {
                                        type: "object",
                                        properties: {
                                            city: {type: "string"},
                                            active: {type: "boolean", default: true}
                                        }
                                    }
                                ]
                            }
                        }
                    }
                };

                ctx = {
                    method: {
                        ctor: model
                    },
                    req: {
                        body: {}
                    }
                };
            });

            it('should handle properties', function(){
                ctx.req.body = {
                    telephones: [
                        {contact: 'bob', available: false},
                        {city: 'Rio de Janeiro'}
                    ]
                };
                var body = readOnlyDefaultValuesHandler(ctx);

                expect(body).to.be.eql({
                    telephones: [
                        {contact: 'bob', available: true},
                        {city: 'Rio de Janeiro', active: true}
                    ]
                });
            });
        });
    });
});
