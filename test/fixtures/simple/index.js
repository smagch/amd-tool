require.config({
  baseUrl: './test/fixtures/simple'
});

require(['b'], function (b) {
  console.log('loaded');
});