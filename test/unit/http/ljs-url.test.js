require('../../support');

var expect = require('chai').expect;

var LJSUrl = require('../../../lib/http/ljs-url');

describe('LJSUrl', function() {
    var ljsUrl;

    describe('properties', function() {
        describe('when url represents an item', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('http://example.org/api/people/1?query=string');
            });

            it("should return 'people' as collectionName", function() {
                expect(ljsUrl.collectionName).to.equal('people');
            });

            it("should return '1' as resourceId", function() {
                expect(ljsUrl.resourceId).to.equal('1');
            });

            it("should return 'api' as restApiRoot", function() {
                expect(ljsUrl.restApiRoot).to.equal('api');
            });
        });

        describe('when url represents a collection', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('http://example.org/api/people?query=string');
            });

            it("should return 'people' as collectionName", function() {
                expect(ljsUrl.collectionName).to.equal('people');
            });

            it("should return undefined as resourceId", function() {
                expect(ljsUrl.resourceId).to.be.undefined;
            });

            it("should return 'api' as restApiRoot", function() {
                expect(ljsUrl.restApiRoot).to.equal('api');
            });
        });
    });

    describe('.buildFromModel', function() {
        beforeEach(function() {
            var person = {
                id: 1,
                constructor: {
                    pluralModelName: 'people'
                }
            };

            var ljsReq = {};
            ljsReq.baseUrl = this.sinon.stub().returns('http://example.org/api');
            this.ljsUrl = LJSUrl.buildFromModel(ljsReq, person);
        });

        it('should build url from given model', function() {
            expect(this.ljsUrl.url).to.eq('http://example.org/api/people/1');
        });
    });

    describe('.buildFromCollectionName', function() {
        beforeEach(function() {
            var ljsReq = {};
            ljsReq.baseUrl = this.sinon.stub().returns('http://example.org/api');
            this.ljsUrl = LJSUrl.buildFromCollectionName(ljsReq, 'people');
        });

        it('should build url from given collection name', function() {
            expect(this.ljsUrl.url).to.eq('http://example.org/api/people');
        });
    });

    describe('#isInstance', function() {
        describe('when url represents an item', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('http://example.org/api/people/1');
            });

            it('should return true', function () {
                expect(ljsUrl.isInstance()).to.be.true;
            });
        });

        describe('when url represents a collection', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('http://example.org/api/people');
            });

            it('should return true', function () {
                expect(ljsUrl.isInstance()).to.be.true;
            });
        });

        describe('when url represents an item schema', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('http://example.org/api/item-schemas/1');
            });

            it('should return false', function() {
                expect(ljsUrl.isInstance()).to.be.false;
            });
        });

        describe('when url represents a collection schema', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('http://example.org/api/collection-schemas/1');
            });

            it('should return false', function() {
                expect(ljsUrl.isInstance()).to.be.false;
            });
        });

        describe('when url represents swagger resources', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('http://example.org/api/swagger/resources');
            });

            it('should return false', function() {
                expect(ljsUrl.isInstance()).to.be.false;
            });
        });
    });

    describe('#isCollection', function () {
        describe('when url represents a collection', function () {
            beforeEach(function() {
                ljsUrl = new LJSUrl('http://example.org/api/people');
            });

            it('should return true', function () {
                expect(ljsUrl.isCollection()).to.be.true;
            });
        });

        describe('when url represents an item', function () {
            beforeEach(function() {
                ljsUrl = new LJSUrl('http://example.org/api/people/1');
            });

            it('should return false', function () {
                expect(ljsUrl.isCollection()).to.be.false;
            });
        });
    });

    describe('#isSchema', function() {
        describe('when url represents an item schema', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('http://example.org/api/item-schemas/1');
            });

            it('should return true', function() {
                expect(ljsUrl.isSchema()).to.be.true;
            });
        });

        describe('when url represents a collection schema', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('http://example.org/api/collection-schemas/1');
            });

            it('should return true', function() {
                expect(ljsUrl.isSchema()).to.be.true;
            });
        });

        describe('when url does not represent a schema', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('http://example.org/api/people/1');
            });

            it('should return true', function() {
                expect(ljsUrl.isSchema()).to.be.false;
            });
        });
    });

    describe('#isRelative', function() {
        describe('when url is relative', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('/api/people');
            });

            it('should be true', function() {
                expect(ljsUrl.isRelative()).to.be.true;
            });
        });

        describe('when url is absolute', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('http://example.org/api/people');
            });

            it('should be true', function() {
                expect(ljsUrl.isRelative()).to.be.false;
            });
        });
    });
});