var fs = require('fs')
  , path = require('path')
  , debug = require('debug')('amd')
  , sandbox = require('./sandbox');

/**
 * get tree Object for archy
 *
 * @param {String} name to resolve dependencies
 * @param {Object} dependencies map
 * @return {Object} archy tree format Object
 */
exports.getTree = function (mainName, depMap) {
  debug('mainName : ' + mainName);

  return {
    label: mainName
  , nodes: decorateDeps(depMap[mainName], depMap)
  };
};

/**
 * get dependencies by tree
 *
 * @param {Array}
 * @param {Object}
 * @return {Array}
 * @api private
 */
function decorateDeps(deps, depMap) {
  var ret = [];

  deps.forEach(function (name) {
    if (depMap[name] && depMap[name].length) {
      var node = {};
      node.label = name;
      node.nodes = decorateDeps(depMap[name], depMap);
      ret.push(node);
    } else {
      ret.push(name);
    }
  });

  return ret;
}