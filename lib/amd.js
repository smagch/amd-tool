var vm = require('vm')
  , readFile = require('fs').readFile
  , path = require('path')
  , fs = require('fs')
  , _ = require('underscore')
  , inherits = require('util').inherits
  , utils = require('./utils')
  , debug = require('debug')('amd')
  , EventEmitter = require('events').EventEmitter
  , paths = require('./paths')
  , sandbox = require('./sandbox');
 
/**
 * entry point
 *
 * @param {Object|String} path or config object
 * @return {Amd}
 */
module.exports = function (configPath) {
  return new Amd(configPath);
};

// expose Amd
// exports.Amd = Amd;

// default config
var defaults = {
  baseUrl: path.resolve('.')
};

/**
 * Amd Object
 *
 * @param {String} * optional
 * @return {Amd} for chaning
 */
function Amd(conf) {
  this.options = _.clone(defaults);
  this._resolved = [];
  this._loading = {};
  this._depMap = {};
  this.config(conf || defaults);
  EventEmitter.call(this);
  return this;
}

inherits(Amd, EventEmitter);

Amd.prototype.constructor = Amd;


/**
 * set config
 *
 * @param {Object|String} direct object or filePath, {JSON|commonJS|AMD}
 * @return {Amd} for chaining
 */
Amd.prototype.config = function (conf) {
  var self = this;

  if (typeof conf === 'string') {
    conf = this.loadConfig(conf);
  }

  for (var name in conf) {
    if (paths[name]) {
      this.options[name] = path.resolve(conf[name]);
    } else {
      this.options[name] = conf[name];
    }
  }

  debug('baseUrl : ' + this.options.baseUrl);

  return this;
};

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
  return this._resolved.indexOf(name) !== -1;
};

/**
 * add resolved filePath
 */
Amd.prototype.resolve = function (name) {
  if (this.has(name)) {
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
  var self = this;

  if (this._loading[name]) return;
  this._loading[name] = true;

  var filePath = this.resolvePath(name);

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
 * load config file
 *
 * @param {String} - JSON or amd style define
 * @api private
 */
Amd.prototype.loadConfig = function (filePath) {
  var ext = path.extname(filePath);
  // if config is JSON, load simply
  if (ext === '.json') {
    filePath = path.relative(__dirname, path.resolve(filePath));
    debug('about to load config : ' + filePath);
    return require(filePath);
  }

  var data = fs.readFileSync(filePath, 'utf8')
    , context = vm.createContext(sandbox.config(this));

  vm.runInContext(data, context);
  return context.get();
};

/**
 * get dependencies from buffer
 *
 * @return {Array}
 * @api public
 */
Amd.prototype.getDependencies = function (data) {
  var script = String(data)
    , context = vm.createContext(sandbox.deps(this));

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
  return path.resolve(this.options.baseUrl, filePath);
};

