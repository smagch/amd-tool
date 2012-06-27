var amd = require('../lib/amd')
  , expect = require('expect.js')
  , resolve = require('path').resolve;

describe('amd', function () {

  describe('.list(path)', function () {

  });

  describe('.getDependencies(data)', function () {
    
    it('should return empty Array when it has no deps', function (done) {
      var deps = amd().getDependencies('define({});');
      expect(deps).to.be.an('array');
      expect(deps).to.have.length(0);
      done();
    });

    it("should return define's first arguments when it is Array", function (done) {
      var deps = amd().getDependencies('define(["a", "b"], function (a, b) {return {};});');
      expect(deps).to.be.an('array');
      expect(deps).to.have.length(2);
      done();
    });

    it("should return empty Array when the define's first argument is a String", function (done) {
      var deps = amd().getDependencies('define("mymodule", function () {return {};});');
      expect(deps).to.be.an('array');
      expect(deps).to.have.length(0);
      done();
    });
  });
});
  