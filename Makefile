help:
	@echo '    setup ....................................... sets up project'
	@echo '    clean ....................................... cleans project'
	@echo '    test ........................................ runs tests'
	@echo '    test-verbose ................................ runs tests with spec reporter'
	@echo '    debug ....................................... runs tests with debug enable'
	@echo '    testing ..................................... runs tests continuously on file changes'
	@echo '    bump_patch_version .......................... bumps patch version'
	@echo '    bump_minor_version .......................... bumps minor version'
	@echo '    bump_major_version .......................... bumps major version'

link:
	npm link ../JSV

unlink:
	npm unlink ../JSV

setup:
	npm install

clean:
	rm -rf node_modules

TESTER = ./node_modules/.bin/mocha
OPTS = -G --recursive
TESTS = test/**/*.test.js

test:
	$(TESTER) $(OPTS) "$(TESTS)"
test-verbose:
	$(TESTER) $(OPTS) --reporter spec "$(TESTS)"
testing:
	$(TESTER) $(OPTS) --watch "$(TESTS)"
debug:
	$(TESTER) $(OPTS) --debug-brk --watch "$(TESTS)"

.PHONY: test

bump_%_version:
	npm version $*
	git push origin master
	git push origin --tags
	npm publish --registry https://registry.npmjs.org/
