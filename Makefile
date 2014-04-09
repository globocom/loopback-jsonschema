help:
	@echo '    test ............................. runs tests'
	@echo '    test-verbose ..................... runs tests with spec reporter'
	@echo '    testing .......................... runs tests continuously on file changes'

TESTER = ./node_modules/.bin/mocha
OPTS = -G
TESTS = test/*.test.js

test:
	$(TESTER) $(OPTS) $(TESTS)
test-verbose:
	$(TESTER) $(OPTS) --reporter spec $(TESTS)
testing:
	$(TESTER) $(OPTS) --watch $(TESTS)

.PHONY: test