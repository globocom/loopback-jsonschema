help:
	@echo '    setup ............................ sets up project'
	@echo '    clean ................... cleans project'
	@echo '    test ............................. runs tests'
	@echo '    test-verbose ..................... runs tests with spec reporter'
	@echo '    testing .......................... runs tests continuously on file changes'

setup:
	npm install

clean:
	rm -rf node_modules

TESTER = ./node_modules/.bin/mocha
OPTS = -G
TESTS = test/**/*.test.js

test:
	$(TESTER) $(OPTS) $(TESTS)
test-verbose:
	$(TESTER) $(OPTS) --reporter spec $(TESTS)
testing:
	$(TESTER) $(OPTS) --watch $(TESTS)

.PHONY: test
