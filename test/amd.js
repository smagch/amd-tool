var amd = require('../lib/amd')
  , expect = require('expect.js')
  , path = require('path')
  , resolve = path.resolve
  , testConfig = {
      baseUrl: './test/fixtures'
    }
  , testDir = resolve(__dirname, 'fixtures')
  , simpleDir = resolve(testDir, 'simple');

describe('amd', function () {

  describe('(options)', function (done) {
    it('should override given options  when the first argument is a Object', function (done) {
      var options = amd(testConfig).options;
      expect(testDir).to.eql(options.baseUrl);
      done();
    });

    it('should load config when the first argument is a String', function (done) {
       amd('./test/fixtures/simple/config.json')
        .list('index-noconf', function (err, deps) {
          if (err) return done(err);
          expect(deps).to.be.an('array');
          expect(deps).to.have.length(3);
          done();
        });
     });

    it('should load config when the first argument is a String', function (done) {
      amd('./test/fixtures/simple/config.js')
        .list('index-noconf', function (err, deps) {
          if (err) return done(err);
          expect(deps).to.be.an('array');
          expect(deps).to.have.length(3);
          done();
        });
     });
  });

  describe('.config(conf)', function () {

    it('should set config', function (done) {
      var options = {
            baseUrl: './test/fixtures/simple'
          };
      amd().config(options).list('index', function (err, deps) {
        if (err) return done(err);
        expect(deps).to.be.an('array');
        expect(deps).to.have.length(3);
        done();
      });
    });

    it('should load json when extname is json', function (done) {
      amd().config('./test/fixtures/simple/config.json').list('index-noconf', function (err, deps) {
        if (err) return done(err);
        expect(deps).to.be.an('array');
        expect(deps).to.have.length(3);
        done();
      });
    });

    it('should load amd style config', function (done) {
      amd().config('./test/fixtures/simple/config.js').list('index-noconf', function (err, deps) {
        if (err) return done(err);
        expect(deps).to.be.an('array');
        expect(deps).to.have.length(3);
        done();
      });
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

    // suger http://requirejs.org/docs/whyamd.html#sugar
    it('should work with suger', function (done) {
      amd().list('./test/fixtures/simple/suger', function (err, deps) {
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
  