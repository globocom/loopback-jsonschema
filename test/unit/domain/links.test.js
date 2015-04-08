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

        before(function() {
            var defaultLinks = [
                { rel: 'self', href: '/api' }
            ];
            var relationLinks = [
                { rel: 'work', href: '/api/MyApi/{id}/work' }
            ];
            var customLinks = [
                { rel: 'custom-absolute', href: 'http://other.example.org/custom-absolute' },
                { rel: 'custom-relative', href: '/custom-relative' },
                { rel: 'self', href: 'http://example.org/api/override/self' }
            ];
            var links = new Links(defaultLinks, relationLinks, customLinks);
            allLinks = links.all();
        });

        it('should include default links', function() {
            expect(allLinks[0]).to.eql({ rel: 'self', href: '/api' });
        });

        it('should include relation links', function(){
            expect(allLinks[1]).to.eql({ rel: 'work', href: '/api/MyApi/{id}/work' });
        });

        it('should include custom absolute links', function() {
            expect(allLinks[2]).to.eql({ rel: 'custom-absolute', href: 'http://other.example.org/custom-absolute' });
        });

        it('should include custom relative links', function() {
            expect(allLinks[3]).to.eql({ rel: 'custom-relative', href: '/custom-relative' });
        });

        it('should not allow overriding default links', function() {
            expect(allLinks).to.have.length(4);
            expect(allLinks[0]).to.eql({ rel: 'self', href: '/api' });
        });
    });

    describe('#customLinks', function() {
        var returnedCustomLinks;
        before(function() {
            var defaultLinks = [
                { rel: 'self', href: '/api' }
            ];
            var relationLinks = [];
            var customLinks = [
                { rel: 'custom-absolute', href: 'http://other.example.org/custom-absolute' },
                { rel: 'custom-relative', href: '/custom-relative' },
                { rel: 'self', href: 'http://example.org/api/override/self' }
            ];
            var links = new Links(defaultLinks, relationLinks, customLinks);
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

    describe('#relationLinks', function() {
        var returnedRelationLinks;
        before(function() {
            var defaultLinks = [
                { rel: 'self', href: '/api' }
            ];
            var relationLinks = [
                { rel: 'friend', href: '/api/people/{id}/friend' },
                { rel: 'self', href: 'http://example.org/api/override/self' }
            ];
            var customLinks = [];

            var links = new Links(defaultLinks, relationLinks, customLinks);
            returnedRelationLinks = links.relations();
        });

        it('should include custom absolute links', function() {
            expect(returnedRelationLinks[0]).to.eql({ rel: 'friend', href: '/api/people/{id}/friend' });
        });

        it('should not allow overriding default links', function() {
            expect(returnedRelationLinks).to.have.length(1);
        });
    });
});
