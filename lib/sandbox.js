var isArray = require('util').isArray
  , commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg
  , cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g
  , debug = require('debug')('amd')
  , noop = function () {};


/**
 * context to get `require.config()` value
 *
 * @param {AMD}
 * @return {Object}
 */
exports.config = function () {
  var config = {}
    , context = {};

  context.define = noop;
  context.require = noop;
  context.require.config = function (conf) {
    config = conf;
  };

  context.get = function () {
    return config;
  };
  return context;
};

/**
 * context to get `define()` value
 *    TODO what to do if it has deps?
 * @api private
 */
exports.define = function () {
  var exports = []
    , context = {};

  context.define = function (arg1) {
    if (typeof arg1 === 'function') {
      exports = arg1();
    } else {
      exports = arg1;
    }
  };

  context.exports = function () {
    return exports;
  };
  return exports;
};


/**
 * create AMD env context
 *
 * @param {Amd}
 * @return {Object}
 *  TODO allow global option?
 */
exports.deps = function (amd) {
  var deps = []
    , context = {};

  context.define = define;
  context.require = define;
  context.require.config = function (conf) {
    amd.config(conf);
  };

  context.deps = function () {
    return deps;
  };

  return context;

  /**
   * internal function
   */
  function define(arg1) {
    if (isArray(arg1)) {
      deps = arg1;
      return;
    }

    // suger http://requirejs.org/docs/whyamd.html#sugar
    if (typeof arg1 === 'function') {
      arg1
        .toString()
        .replace(commentRegExp, '')
        .replace(cjsRequireRegExp, function (match, dep) {
          debug('found suger : ' + dep);
          deps.push(dep);
        });
    }
  }
};