# need to `npm install -g mocha`

# need to `npm install jshint`
lint:
	@jshint ./lib/*.js

.PHONY: test lint