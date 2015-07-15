var expect = require('chai').expect;
var traverse = require('traverse');

var readOnlyDefaultValuesHandler = require('../../../lib/domain/readonly-default-values-handler');

describe('readOnlyDefaultValuesHandler', function() {
    var ctx;

    beforeEach(function() {
        ctx = {req: {method: 'POST'}};
    });

    describe('readOnly', function() {
        it('should remove property', function(){
            traverse(ctx).set(['method', 'ctor', 'cachedItemSchema', 'properties'], {
                name: {type: 'string'},
                status: {readOnly: true, type: 'string'}
            });

            traverse(ctx).set(['req', 'body'], {name: 'wilson', status: 'single'});

            var body = readOnlyDefaultValuesHandler(ctx);
            expect(body).to.be.eql({
                name: 'wilson'
            });
        });

        describe('when schema has a array object of a one type', function(){
            beforeEach(function() {
                traverse(ctx).set(['method', 'ctor', 'cachedItemSchema', 'properties'], {
                    medias: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                path: {type: 'string'},
                                author: {type: 'string', readOnly: true}
                            }
                        }

                    }
                });
            });

            it('should remove property', function(){
                traverse(ctx).set(['req', 'body'], {
                    medias: [
                        {path: '/user/tmp', author: 'wilson'},
                        {path: '/tmp/imgs', author: 'isa'}
                    ]
                });
                var body = readOnlyDefaultValuesHandler(ctx);

                expect(body).to.be.eql({
                    medias: [
                        {path: '/user/tmp'},
                        {path: '/tmp/imgs'}
                    ]
                });
            });

            it('should handle invalid payload', function(){
                traverse(ctx).set(['req', 'body'], {});
                var body = readOnlyDefaultValuesHandler(ctx);
                expect(body).to.be.eql({});
            });
        });

        describe('when schema has a nested objects', function(){
            beforeEach(function() {
                traverse(ctx).set(['method', 'ctor', 'cachedItemSchema', 'properties'], {
                    name: {type: 'string'},
                    contact: {
                        type: 'object',
                        properties: {
                            age: {type: 'number'},
                            status: {readOnly: true, type: 'string'}
                        }
                    }
                });
            });

            it('should remove property', function(){
                traverse(ctx).set(['req', 'body'], {
                    name: 'wilson',
                    contact: {
                        status: 'single',
                        age: 12
                    }
                });
                var body = readOnlyDefaultValuesHandler(ctx);

                expect(body).to.be.eql({
                    name: 'wilson',
                    contact: {
                        age: 12
                    }
                });
            });

            it('should keep parent key', function(){
                traverse(ctx).set(['req', 'body'], {
                    name: 'wilson',
                    contact: {
                        status: 'single'
                    }
                });

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
            traverse(ctx).set(['method', 'ctor', 'cachedItemSchema', 'properties'], {
                name: {type: 'string'},
                status: {default: 'default_status', type: 'string'}
            });
        });

        describe('when schema has a array object of a one type', function(){
            beforeEach(function() {
                traverse(ctx).set(['method', 'ctor', 'cachedItemSchema', 'properties'], {
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
                });
            });

            it('should apply default value', function(){
                traverse(ctx).set(['req', 'body'], {
                    medias: [
                        {path: '/user/tmp'},
                        {path: '/tmp/imgs'}
                    ]
                });
                var body = readOnlyDefaultValuesHandler(ctx);

                expect(body).to.be.eql({
                    medias: [
                        {path: '/user/tmp', author: 'Paulo Coelho'},
                        {path: '/tmp/imgs', author: 'Paulo Coelho'}
                    ]
                });
            });

            it('should handle invalid payload', function(){
                traverse(ctx).set(['req', 'body'], {});
                var body = readOnlyDefaultValuesHandler(ctx);
                expect(body).to.be.eql({});
            });
        });

        describe('when default value is applied', function() {
            it('should use the default value when property is not defined', function(){
                traverse(ctx).set(['req', 'body'], {
                    name: 'wilson'
                });

                var body = readOnlyDefaultValuesHandler(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    status: 'default_status'
                });
            });

            it('should not ignore property with null value', function(){
                traverse(ctx).set(['req', 'body'], {name: 'wilson', status: null});

                var body = readOnlyDefaultValuesHandler(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    status: null
                });
            });
        });

        describe('when schema has nested objects', function(){
            beforeEach(function() {
                traverse(ctx).set(['method', 'ctor', 'cachedItemSchema', 'properties'], {
                    name: {type: 'string'},
                    contact: {
                        type: 'object',
                        properties: {
                            age: {type: 'number'},
                            status: {default: 'active', type: 'string'}
                        }
                    }
                });
            });

            it('should apply default value', function(){
                traverse(ctx).set(['req', 'body'], {
                    name: 'wilson',
                    contact: {
                        age: 12
                    }
                });

                var body = readOnlyDefaultValuesHandler(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    contact: {
                        status: 'active',
                        age: 12
                    }
                });
            });


            it('should apply default value for nested object', function(){
                traverse(ctx).set(['req', 'body'], {
                    name: 'wilson'
                });

                var body = readOnlyDefaultValuesHandler(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    contact: {
                        status: 'active'
                    }
                });
            });
        });

        describe('when default value is not applied', function() {
            it('should ignore the default value', function(){
                traverse(ctx).set(['req', 'body'], {name: 'wilson', status: 'custom_status'});

                var body = readOnlyDefaultValuesHandler(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    status: 'custom_status'
                });
            });

            it('should ignore the default value even for boolean types', function(){
                traverse(ctx).set(['method', 'ctor', 'cachedItemSchema', 'properties'], {
                    name: {type: 'string'},
                    active: {default: true, type: 'boolean'}
                });

                traverse(ctx).set(['req', 'body'], {
                    name: 'wilson', active: false
                });

                var body = readOnlyDefaultValuesHandler(ctx);

                expect(body).to.be.eql({
                    name: 'wilson',
                    active: false
                });
            });

            it('should ignore the default value even for number types', function(){
                traverse(ctx).set(['method', 'ctor', 'cachedItemSchema', 'properties'], {
                    name: {type: 'string'},
                    time: {default: 60, type: 'number'}
                });

                traverse(ctx).set(['req', 'body'], {
                    name: 'wilson', time: 0
                });

                var body = readOnlyDefaultValuesHandler(ctx);
                expect(body).to.be.eql({
                    name: 'wilson',
                    time: 0
                });
            });
        });

        describe('when method is PUT', function() {
            beforeEach(function() {
                traverse(ctx).set(['req', 'method'], 'PUT');

                traverse(ctx).set(['method', 'ctor', 'cachedItemSchema', 'properties'], {
                    name: {type: 'string'},
                    status: {type: 'string', default: 'active'}
                });

                traverse(ctx).set(['req', 'body'], {
                    name: 'wilson'
                });
            });

            it('should not apply default value', function() {
                var body = readOnlyDefaultValuesHandler(ctx);
                expect(body).to.eql({name: 'wilson'});
            });
        });
    });

    describe('when the field is readOnly and has default value', function(){
        beforeEach(function(){
            traverse(ctx).set(['req', 'body'], {name: 'wilson', status: 'single'});
        });

        it('should not replace current value when readOnly is false', function(){
            traverse(ctx).set(['method', 'ctor', 'cachedItemSchema', 'properties'], {
                name: {type: 'string'},
                status: {readOnly: false, type: 'string', default: 'active'}
            });

            var body = readOnlyDefaultValuesHandler(ctx);
            expect(body).to.be.eql({
                name: 'wilson',
                status: 'single'
            });

        });

        it('should replace current value with default value', function(){
            traverse(ctx).set(['method', 'ctor', 'cachedItemSchema', 'properties'], {
                name: {type: 'string'},
                status: {readOnly: true, type: 'string', default: 'active'}
            });

            traverse(ctx).set(['req', 'body'], {name: 'wilson', status: 'single'});

            var body = readOnlyDefaultValuesHandler(ctx);
            expect(body).to.be.eql({
                name: 'wilson',
                status: 'active'
            });
        });

        describe('when schema has a array object of a one type', function(){
            beforeEach(function() {
                traverse(ctx).set(['method', 'ctor', 'cachedItemSchema', 'properties'], {
                    telephones: {
                        type: 'array',
                        items: [
                            {
                                type: 'object',
                                properties: {
                                    contact: {type: 'string'},
                                    available: {type: 'boolean', readOnly: true, default: true}
                                }
                            },
                            {
                                type: 'object',
                                properties: {
                                    city: {type: 'string'},
                                    active: {type: 'boolean', default: true}
                                }
                            }
                        ],
                        additionalItems: {
                            type: 'object',
                            properties: {
                                extra: {type: 'string', readOnly: true, default: true},
                                number: {type: 'string', default: 'not definied'}
                            }
                        }
                    }
                });
            });

            it('should handle properties', function(){
                traverse(ctx).set(['req', 'body'], {
                    telephones: [
                        {contact: 'bob', available: false},
                        {city: 'Rio de Janeiro'},
                        {extra: false, number: 'definied'},
                        {extra: false},
                        {extra: true},
                        {}
                    ]
                });
                var body = readOnlyDefaultValuesHandler(ctx);

                expect(body).to.be.eql({
                    telephones: [
                        {contact: 'bob', available: true},
                        {city: 'Rio de Janeiro', active: true},
                        {extra: true, number: 'definied'},
                        {extra: true, number: 'not definied'},
                        {extra: true, number: 'not definied'},
                        {extra: true, number: 'not definied'}
                    ]
                });
            });
        });
    });
});
