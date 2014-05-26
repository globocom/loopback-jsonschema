require('../../support');

var expect = require('chai').expect;

var instanceSchemaCorrelator = require('../../../lib/http/instance-schema-correlator');
var ItemSchema = require('../../../lib/domain/item-schema');
var LJSRequest = require('../../../lib/http/ljs-request');

describe('instanceSchemaCorrelator', function() {
    describe('.correlate', function() {
        var itemSchema, ljsReq, res;

        beforeEach(function(done) {
            ItemSchema.create({
                modelName: 'person',
                collectionName: 'people',
                title: 'Person',
                collectionTitle: 'People',
                type: 'object',
                properties: {}
            }, function(err, data) {
                if (err) { throw err };
                itemSchema = data;
                done();
            });

            ljsReq = new LJSRequest();
            ljsReq.baseUrl = this.sinon.stub().returns('http://example.org/api');
            res = { set: this.sinon.spy() };
        });

        describe('when request is for an item', function() {
            beforeEach(function() {
                ljsReq.fullUrl = this.sinon.stub().returns('http://example.org/api/people/1');
                instanceSchemaCorrelator.correlate(itemSchema, ljsReq, res);
            });

            it('should correlate to the corresponding item schema', function() {
                var schemaUrl = 'http://example.org/api/item-schemas/' + itemSchema.id;
                expect(res.set).to.have.been.calledWith('Content-Type', 'application/json; charset=utf-8; profile=' + schemaUrl);
                expect(res.set).to.have.been.calledWith('Link', '<' + schemaUrl + '>; rel=describedby');
            });
        });

        describe('when request is a GET for a collection', function() {
            beforeEach(function() {
                ljsReq.method = 'GET';
                ljsReq.fullUrl = this.sinon.stub().returns('http://example.org/api/people');
                instanceSchemaCorrelator.correlate(itemSchema, ljsReq, res);
            });

            it('should correlate to the corresponding collection schema', function() {
                var schemaUrl = 'http://example.org/api/collection-schemas/' + itemSchema.id;
                expect(res.set).to.have.been.calledWith('Content-Type', 'application/json; charset=utf-8; profile=' + schemaUrl);
                expect(res.set).to.have.been.calledWith('Link', '<' + schemaUrl + '>; rel=describedby');
            });
        });

        describe('when request is for a collection but is not a GET', function() {
            beforeEach(function() {
                ljsReq.method = 'NOTGET';
                ljsReq.fullUrl = this.sinon.stub().returns('http://example.org/api/people');
                instanceSchemaCorrelator.correlate(itemSchema, ljsReq, res);
            });

            it('should correlate to the corresponding item schema', function() {
                var schemaUrl = 'http://example.org/api/item-schemas/' + itemSchema.id;
                expect(res.set).to.have.been.calledWith('Content-Type', 'application/json; charset=utf-8; profile=' + schemaUrl);
                expect(res.set).to.have.been.calledWith('Link', '<' + schemaUrl + '>; rel=describedby');
            });
        });
    });
});
