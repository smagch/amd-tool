var isArray = require('util').isArray
  , _ = require('underscore')
  , commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg
  , cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g
  , debug = require('debug')('amd');

/**
 * return sandbox
 */
exports.sandbox = function (amd) {
  //return new Sandbox(amd);
  var deps = [];
  var sandbox = {
    // TODO support suger
    // http://requirejs.org/docs/whyamd.html#sugar 
    define: function (arg1) {
      if (isArray(arg1)) {
        deps = arg1;
        return;
      }

      if (typeof arg1 === 'function') {
        debug('define: start to find :' + arg1.toString())
        arg1
          .toString()
          .replace(commentRegExp, '')
          .replace(cjsRequireRegExp, function (match, dep) {
            debug('found suger : ' + dep)
            deps.push(dep);
          });
      }
    },
    require: function (arg1) {
      if (isArray(arg1)) {
        deps = arg1;
        return;
      }

      if (typeof arg1 === 'function') {
        debug('require: start to find' + arg1.toString());
        arg1
          .toString()
          .replace(commentRegExp, '')
          .replace(cjsRequireRegExp, function (match, dep) {
            debug('found suger : ' + dep)
            deps.push(dep);
          });
      }
    },
    deps: function () {
      return deps;
    }
  };

  // TODO is this a right choice?
  sandbox.require.config = function (conf) {
    _.extend(amd.options, conf);
  };

  return sandbox;
};

// function Sandbox(amd) {
//   this.deps = [];
//   this.amd = amd;
// };
// 
// Sandbox.prototype.define =
// Sandbox.prototype.require = function (arg1) {
//   if (isArray(arg1)) {
//     this.deps = arg1;
//   }
// };
// 
// /**
//  * override config
//  */
// Sandbox.prototype.require.config = function (conf) {
//   _.extend(this.amd.options, conf);
// };
// 
// /**
//  * create sandbox for config loading
//  */
// exports.configSandbox = function () {
//   
// };