var amd = require('../lib/amd')
  , expect = require('expect.js')
  , path = require('path')
  , resolve = path.resolve
  , config = {
      baseUrl: './test/fixtures'
    };

describe('amd', function () {

  describe('(options)', function (done) {
    it('should override given options', function (done) {
      var options = amd(config).options;
      expect(resolve(__dirname, 'fixtures')).to.eql(options.baseUrl);
      done();
    });
  });

  describe('.list(path)', function () {

    it('should work with baseUrl conf', function (done) {
      amd({
        baseUrl: './test/fixtures/simple'
      })
      .list('index', function (err, deps) {
        if (err) return done(err);
        expect(deps).to.be.an('array');
        expect(deps).to.have.length(3);
        done();
      });
    });

    it('should read config at runtime', function (done) {
      amd().list('./test/fixtures/simple/index', function (err, deps) {
        if (err) return done(err);
        expect(deps).to.be.an('array');
        expect(deps).to.have.length(3);
        done();
      });
    });
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

    // TODO test `require`
    //it("should return")
  });
});
  