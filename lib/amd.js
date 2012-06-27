var vm = require('vm')
  , readFile = require('fs').readFile
  , reader = require('./reader')
  , path = require('path')
  , isArray = require('util').isArray
  , async = require('async')
  , _ = require('underscore')
  , util = require('util')
  , debug = require('debug')('amd')
  , EventEmitter = require('events').EventEmitter;

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
  EventEmitter.call(this);
}

util.inherits(Amd, EventEmitter);

Amd.prototype.constructor = Amd;

/**
 * get dependencies
 *
 * @param {String}
 * @param {Function}
 * @return {Array} - dependencies
 */
Amd.prototype.list = function (name, done) {
  var self = this;

  // var filePath = path.resolve(this.options.baseUrl, name) + '.js';
  this.load(name, function () {
    done(null, self._resolved);
  });

  return this;
};

/**
 * see if path is resolved
 *
 * @param {String}
 * @return {Boolean}
 */
Amd.prototype.has = function (name) {
  return !!~this._resolved.indexOf(name);
};

/**
 * add resolved filePath
 */
Amd.prototype.resolve = function (name) {
  if (~this._resolved.indexOf(name)) {
    throw new Error('resolve added twice : ' + name);
  }
  this._resolved.push(name);
  this.emit('resolve:' + name);

  return this;
};

/**
 * pend dependencies
 * if all dependencies has resolved, execute the callback `done`
 *
 * @param {Array}
 * @param {Function}
 * @api public
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
 * @api public
 */
Amd.prototype.load = function (name, done) {
  if (this._loading[name]) return;
  this._loading[name] = true;

  var self = this
    , filePath = this.resolvePath(name) + '.js';

  debug('filePath : ' + filePath);

  readFile(filePath, function (err, data) {
    if (err) throw new Error('cannot read file : ' + filePath);
    var deps = self.getDependencies(data);
    debug('String(data) : ' + String(data));

    self.pend(deps, function () {
      self.resolve(name);
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
        require: function (arg1) {
          if (util.isArray(arg1)) {
            deps = arg1;
          }
        }
      };

  var context = vm.createContext(sandbox);
  vm.runInContext(script, context);
  return deps;
};

/**
 * resolve filePath
 *
 * @return {String}
 * @api private
 */
Amd.prototype.resolvePath = function (filePath) {
  return path.resolve(this.options.baseUrl, filePath)
};

