var vm = require('vm')
  , readFile = require('fs').readFile
  , reader = require('./reader')
  , path = require('path')
  , isArray = require('util').isArray
  , async = require('async')
  , _ = require('underscore')
  , util = require('util');

/**
 * entry point
 *
 * @return {AMD}
 */
module.exports = exports = function (configPath) {
  return new Amd(configPath);
};

/**
 * default configration
 *
 * @api private
 * @return {Object}
 */
function defaults() {
  return {
    baseUrl: '.'
  };
};

/**
 * Amd Object
 */
function Amd(configPath) {
  // TODO
  this.context = {};
  this._resolved = [];
  this._loading = {};
  //this._pending = {};
  this.options = _.extend(defaults(), configPath);
  this.options.baseUrl = path.resolve(this.options.baseUrl);
}

Amd.prototype.constructor = Amd;

/**
 * get dependencies
 * @param {String} - path, absolute path
 * @param {Function} - done, callback
 * @return {Array} - dependencies
 */
Amd.prototype.list = function (path, done) {
  this.load(path, function () {
    console.log('get list');
  });

  return this;
};

/**
 * see if path is resolved
 *
 * @param {String}
 * @return {Boolean}
 */
Amd.prototype.has = function (path) {
  return !!~this._resolved.indexOf(path);
};

/**
 * add resolved path
 */
Amd.prototype.resolve = function (path) {
  if (~this._resolved.indexOf(path)) {
    throw new Error('added twice : ' + path);
  }
  this._resolved.push(path);
  this.emit('resolve:' + path);

  return this;
};

/**
 * pend dependencies
 * if all dependencies has resolved, execute the callback `done`
 *
 * @param {Array}
 * @param {Function}
 */
Amd.prototype.pend = function (deps, done) {
  var self = this
    , len = deps.length;

  if (!deps.length) return done();

  var release = function () { --len || done(); };

  deps.forEach(function (dep) {
    if (self.has(dep)) {
      release();
    } else {
      self.once('resolve:' + dep, function () {
        release();
      });
      self.load(dep);
    }
  });

  return this;
};

/**
 * start loading a file
 * if a file has dependencies, then the path become pending state
 *
 * @param {Stirng}
 * @param {Function} *optional
 */
Amd.prototype.load = function (path, done) {
  if (this._loading[path]) return;
  this._loading[path] = true;

  var self = this;

  readFile(path, function (err, data) {
    if (err) throw new Error('cannot read file : ' + path);
    var deps = self.getDependencies(data);
    self.pend(deps, function () {
      self.resolve(path);
      if (done) done();
    });
  });

  return this;
};

/**
 * vm.createContext
 *
 * @return {Array}
 * @api public
 */
Amd.prototype.getDependencies = function (data) {
  var deps = []
    , script = String(data)
    , sandbox = {
        define: function (arg1) {
          if (util.isArray(arg1)) {
            deps = arg1;
          }
        },
        require: function () {}
      };

  var context = vm.createContext(sandbox);
  vm.runInContext(script, context);
  return deps;
};

/**
 * resolve path
 * @return {String}
 * @api private
 */
Amd.prototype.resolvePath = function (path) {
  return path.resolve(this.options.baseUrl, path)
};

