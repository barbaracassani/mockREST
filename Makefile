TESTS = test/*.js
NODE_EXEC    = NODE_PATH=.:$(NODE_PATH)
test:
	mocha --timeout 5000 --reporter nyan $(TESTS)
start:
	node app.js start()

.PHONY: test start