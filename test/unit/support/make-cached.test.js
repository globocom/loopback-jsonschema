require('../../support');
var expect = require('chai').expect;
var makeCached = require('../../../lib/support/make-cached');

describe('makeCached', function() {
    var fn = {
        stringLength: function(string) {
            return string.length;
        }
    };

    var stringLengthCacheKey = function(string) {
        return string;
    };
    var cachedStringLength, length;

    beforeEach(function() {
        this.sinon.spy(fn, 'stringLength');
        cachedStringLength = makeCached(fn.stringLength, stringLengthCacheKey);
    });

    describe('when function value is not cached', function() {
        beforeEach(function() {
            cachedStringLength.flush();
            length = cachedStringLength('ab');
        });

        it('should return function value', function() {
            expect(length).to.eq(2);
        });

        it('should call uncached function', function() {
            expect(fn.stringLength).to.have.been.calledWith('ab');
            expect(fn.stringLength).to.have.been.calledOnce;
        });
    });

    describe('when function value is cached', function() {
        beforeEach(function() {
            cachedStringLength('ab');
            length = cachedStringLength('ab');
        });

        it('should return function value', function() {
            expect(length).to.eq(2);
        });

        it('should not call function', function() {
            expect(fn.stringLength).to.have.been.calledOnce;
        });
    });
});
