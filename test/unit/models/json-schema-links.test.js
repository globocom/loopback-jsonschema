require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var JsonSchemaLinks = require('../../../lib/models/json-schema-links');
var LJSRequest = require('../../../lib/models/ljs-request');

var app = loopback();
app.set('restApiRoot', '/api');

describe('JsonSchemaLinks', function() {
    describe('#all', function() {
        var allLinks;

        beforeEach(function() {
            var req = null;
            var ljsReq = new LJSRequest(req, app);
            this.sinon.stub(ljsReq, 'schemeAndAuthority').returns('http://example.org');
            var defaultLinks = [
                { rel: 'self', href: 'http://example.org/api' }
            ];
            var customLinks = [
                { rel: 'custom-absolute', href: 'http://other.example.org/custom-absolute' },
                { rel: 'custom-relative', href: '/custom-relative' },
                { rel: 'self', href: 'http://example.org/api/override/self' }
            ];
            var links = new JsonSchemaLinks(ljsReq, defaultLinks, customLinks);
            allLinks = links.all();
        });

        it('should include default links', function() {
            expect(allLinks[0]).to.eql({ rel: 'self', href: 'http://example.org/api' });
        });

        it('should include custom absolute links', function() {
            expect(allLinks[1]).to.eql({ rel: 'custom-absolute', href: 'http://other.example.org/custom-absolute' });
        });

        it('should include custom relative links with base url added', function() {
            expect(allLinks[2]).to.eql({ rel: 'custom-relative', href: 'http://example.org/api/custom-relative' });
        });

        it('should not allow overriding default links', function() {
            expect(allLinks).to.have.length(3);
            expect(allLinks[0]).to.eql({ rel: 'self', href: 'http://example.org/api' });
        });
    });
});
