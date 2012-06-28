var vm = require('vm')
  , readFile = require('fs').readFile
  , path = require('path')
  , isArray = require('util').isArray
  , async = require('async')
  , _ = require('underscore')
  , inherits = require('util').inherits
  , isArray = require('util').isArray
  , utils = require('./utils')
  , debug = require('debug')('amd')
  , EventEmitter = require('events').EventEmitter;

/**
 * entry point
 *
 * @param {Object|String} path or config object
 * @return {Amd}
 */
module.exports = exports = function (configPath) {
  return new Amd(configPath);
};

// expose Amd
exports.Amd = Amd;

// default config
var defaults = {
  baseUrl: '.'
};

/**
 * Amd Object
 *
 * @param {String} * optional
 * @return {Amd} for chaning
 */
function Amd(configPath) {
  // TODO
  this._resolved = [];
  this._loading = {};
  this._depMap = {};
  //this._pending = {};
  // TODO readFile
  this.options = _.extend({}, defaults, configPath);
  this.options.baseUrl = path.resolve(this.options.baseUrl);
  EventEmitter.call(this);
  return this;
}

inherits(Amd, EventEmitter);

Amd.prototype.constructor = Amd;

//TODO - use vm.runInContext
/**
 * set config
 */
// Amd.prototype.config = function (filePath) {
//   var self = this
//     , sandbox = {
//         require
//       };
// };

/**
 * get dependencies
 *
 * @param {String}
 * @param {Function}
 */
Amd.prototype.list = function (name, done) {
  var self = this;

  this.load(name, function () {
    done(null, self._resolved);
  });

  return this;
};

/**
 * log dependencies as tree
 *
 * @param {String}
 * @param {Function}
 */
Amd.prototype.tree = function (name, done) {
  var self = this;

  this.list(name, function (err) {
    if (err) return done(err);

    // TODO
    done(null, self._resolved);
  });

  return this;
};

/**
 * optimization
 */
// Amd.prototype.optimize = function (name, done) {
//   this.list(name function (err) {
// 
//   });
// });

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
    , filePath = this.resolvePath(name); // + '.js';

  if (path.extname(filePath) === '') {
    filePath += '.js';
  }

  debug('filePath : ' + filePath);

  readFile(filePath, function (err, data) {
    if (err) throw new Error('cannot read file : ' + filePath);
    var deps = self.getDependencies(data);

    if (self._depMap[name]) throw new Error('duplicate depMap["name"], name : ' + name);

    self._depMap[name] = deps;
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
  var script = String(data)
    , sandbox = utils.sandbox(this)
    , context = vm.createContext(sandbox);

  vm.runInContext(script, context);

  return context.deps();
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

