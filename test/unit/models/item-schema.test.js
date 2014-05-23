require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var ItemSchema = require('../../../lib/models/item-schema');
var LJSRequest = require('../../../lib/http/ljs-request');

var app = loopback();
app.set('restApiRoot', '/api');

describe('ItemSchema', function() {
    describe('#defaultLinks', function() {
        var itemSchema, ljsReq;

        beforeEach(function() {
            var req = null;
            ljsReq = new LJSRequest(req, app);
            this.sinon.stub(ljsReq, 'schemeAndAuthority').returns('http://example.org');
            itemSchema = new ItemSchema({id: 1, collectionName: 'people'});
        });

        it('should return default links', function() {
            expect(itemSchema.defaultLinks(ljsReq)).to.eql([
                { rel: 'self', href: 'http://example.org/api/people/{id}' },
                { rel: 'item', href: 'http://example.org/api/people/{id}' },
                {
                    rel: 'create',
                    method: 'POST',
                    href: 'http://example.org/api/people',
                    schema: {
                        $ref: 'http://example.org/api/item-schemas/1'
                    }
                },
                { rel: 'update', method: 'PUT', href: 'http://example.org/api/people/{id}' },
                { rel: 'delete', method: 'DELETE', href: 'http://example.org/api/people/{id}' }
            ]);
        });
    });

    describe('#url', function() {
        var itemSchema, ljsReq;

        beforeEach(function() {
            var req = null;
            ljsReq = new LJSRequest(req, app);
            this.sinon.stub(ljsReq, 'schemeAndAuthority').returns('http://example.org');
            itemSchema = new ItemSchema({ id: 1 });
        });

        it('should return URL this item schema', function() {
            expect(itemSchema.url(ljsReq)).to.eq('http://example.org/api/item-schemas/1');
        });
    });

    describe('#itemUrlTemplate', function() {
        var itemSchema, ljsReq;

        beforeEach(function() {
            var req = null;
            ljsReq = new LJSRequest(req, app);
            this.sinon.stub(ljsReq, 'schemeAndAuthority').returns('http://example.org');
            itemSchema = new ItemSchema({ collectionName: 'people' });
        });

        it('should return URL template for an item represented by this item schema', function() {
            expect(itemSchema.itemUrlTemplate(ljsReq)).to.eq('http://example.org/api/people/{id}');
        });
    });

    describe('#collectionUrl', function() {
        var itemSchema, ljsReq;

        beforeEach(function() {
            var req = null;
            ljsReq = new LJSRequest(req, app);
            this.sinon.stub(ljsReq, 'schemeAndAuthority').returns('http://example.org');
            itemSchema = new ItemSchema({ collectionName: 'people' });
        });

        it('should return URL for the collection of items represented by this item schema', function() {
            expect(itemSchema.collectionUrl(ljsReq)).to.eq('http://example.org/api/people');
        });
    });

    describe('#update$schema', function() {
        it('should set $schema to hyper-schema draft-04 by default', function() {
            var jsonSchema = new ItemSchema();
            jsonSchema.update$schema();
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-04/hyper-schema#');
        });

        it('should allow overriding of $schema', function() {
            var jsonSchema = new ItemSchema({$schema: 'http://json-schema.org/draft-03/hyper-schema#'});
            jsonSchema.update$schema();
            expect(jsonSchema.$schema).to.equal('http://json-schema.org/draft-03/hyper-schema#');
        });
    });

    describe('#createLoopbackModel', function() {
        var Test;

        beforeEach(function() {
            var jsonSchema = new ItemSchema({modelName: 'test', collectionName: 'testplural'});
            jsonSchema.createLoopbackModel(app);
            Test = loopback.getModel('test');
        });

        it('should create model defined by this json schema', function() {
            expect(Test).to.exist;
        });

        it("should use collectionName as model's plural", function() {
            expect(Test.pluralModelName).to.equal('testplural');
        });
    });
});
