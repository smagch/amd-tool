require.config({
  baseUrl: './test/fixtures/simple'
});

require(function (require) {
  var a = require('a')
    , b = require('b');

  return {};
});