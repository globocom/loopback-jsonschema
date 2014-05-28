require('../../support');

var expect = require('chai').expect;
var loopback = require('loopback');

var Links = require('../../../lib/domain/links');
var LJSRequest = require('../../../lib/http/ljs-request');

var app = loopback();
app.set('restApiRoot', '/api');

describe('Links', function() {
    describe('#all', function() {
        var allLinks;

        beforeEach(function() {
            var defaultLinks = [
                { rel: 'self', href: '/api' }
            ];
            var customLinks = [
                { rel: 'custom-absolute', href: 'http://other.example.org/custom-absolute' },
                { rel: 'custom-relative', href: '/custom-relative' },
                { rel: 'self', href: 'http://example.org/api/override/self' }
            ];
            var links = new Links(defaultLinks, customLinks);
            allLinks = links.all();
        });

        it('should include default links', function() {
            expect(allLinks[0]).to.eql({ rel: 'self', href: '/api' });
        });

        it('should include custom absolute links', function() {
            expect(allLinks[1]).to.eql({ rel: 'custom-absolute', href: 'http://other.example.org/custom-absolute' });
        });

        it('should include custom relative links', function() {
            expect(allLinks[2]).to.eql({ rel: 'custom-relative', href: '/custom-relative' });
        });

        it('should not allow overriding default links', function() {
            expect(allLinks).to.have.length(3);
            expect(allLinks[0]).to.eql({ rel: 'self', href: '/api' });
        });
    });

    describe('#customLinks', function() {
        beforeEach(function() {
            var defaultLinks = [
                { rel: 'self', href: '/api' }
            ];
            var customLinks = [
                { rel: 'custom-absolute', href: 'http://other.example.org/custom-absolute' },
                { rel: 'custom-relative', href: '/custom-relative' },
                { rel: 'self', href: 'http://example.org/api/override/self' }
            ];
            var links = new Links(defaultLinks, customLinks);
            returnedCustomLinks = links.custom();
        });

        it('should include custom absolute links', function() {
            expect(returnedCustomLinks[0]).to.eql({ rel: 'custom-absolute', href: 'http://other.example.org/custom-absolute' });
        });

        it('should include custom relative links', function() {
            expect(returnedCustomLinks[1]).to.eql({ rel: 'custom-relative', href: '/custom-relative' });
        });

        it('should not allow overriding default links', function() {
            expect(returnedCustomLinks).to.have.length(2);
        });
    });
});
