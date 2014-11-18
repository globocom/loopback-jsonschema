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

            it('should return example.org as host', function() {
                expect(ljsUrl.host).to.equal('example.org');
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

            it('should return example.org as host', function() {
                expect(ljsUrl.host).to.equal('example.org');
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

        describe('when url is undefined', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl(undefined);
            });

            it('should return undefined as host', function() {
                expect(ljsUrl.host).to.be.undefined;
            });

            it("should return undefined collectionName", function() {
                expect(ljsUrl.collectionName).to.be.undefined;
            });

            it("should return undefined as resourceId", function() {
                expect(ljsUrl.resourceId).to.be.undefined;
            });

            it("should return undefined as restApiRoot", function() {
                expect(ljsUrl.restApiRoot).to.be.undefined;
            });
        });

        describe('when url is null', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl(null);
            });

            it('should return undefined as host', function() {
                expect(ljsUrl.host).to.be.undefined;
            });

            it("should return undefined collectionName", function() {
                expect(ljsUrl.collectionName).to.be.undefined;
            });

            it("should return undefined as resourceId", function() {
                expect(ljsUrl.resourceId).to.be.undefined;
            });

            it("should return undefined as restApiRoot", function() {
                expect(ljsUrl.restApiRoot).to.be.undefined;
            });
        });

        describe('when url is empty strng', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('');
            });

            it('should return undefined as host', function() {
                expect(ljsUrl.host).to.be.undefined;
            });

            it("should return undefined collectionName", function() {
                expect(ljsUrl.collectionName).to.be.undefined;
            });

            it("should return undefined as resourceId", function() {
                expect(ljsUrl.resourceId).to.be.undefined;
            });

            it("should return undefined as restApiRoot", function() {
                expect(ljsUrl.restApiRoot).to.be.undefined;
            });
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
        describe('when host is null', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('/api/people');
            });

            it('should be true', function() {
                expect(ljsUrl.isRelative()).to.be.true;
            });
        });

        describe('when url has protocol http://', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('http://example.com/api/people');
            });

            it('should be false', function() {
                expect(ljsUrl.isRelative()).to.be.false;
            });
        });

        describe('when url has protocol https://', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('https://example.com/api/people');
            });

            it('should be false', function() {
                expect(ljsUrl.isRelative()).to.be.false;
            });
        });

        describe('when url has protocol http and template', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('http://{template}/api/people');
            });

            it('should be false', function() {
                expect(ljsUrl.isRelative()).to.be.false;
            });
        });

        describe('when url has protocol https and template', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('https://{template}/api/people');
            });

            it('should be false', function() {
                expect(ljsUrl.isRelative()).to.be.false;
            });
        });

        describe('when url start with template', function() {
            beforeEach(function() {
                ljsUrl = new LJSUrl('{template}/api/people');
            });

            it('should be false', function() {
                expect(ljsUrl.isRelative()).to.be.false;
            });
        });
    });
});