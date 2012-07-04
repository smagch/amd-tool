var fs = require('fs')
  , path = require('path')
  , debug = require('debug')('amd')
  , sandbox = require('./sandbox');

/**
 * get tree Object for archy
 *
 * @param {String} name to resolve dependencies
 * @param {Object} has "depMap", "errorMap", "absMap"
 * @return {Object} archy tree format Object
 */
exports.getTree = function (mainName, data) {
  return {
    label: mainName
  , nodes: decorateDeps(data.depMap[mainName], data)
  };
};

/**
 * make dep Array treed dep Array in Archy format
 *
 * Example
 *
 *    ["a", "b", "c"] =>
 *    [
 *      {
 *        label: "a",
 *        deps: [...]
 *      },
 *      {
 *        label: "b",
 *        deps: [...]
 *      },
 *      "c"
 *    ]
 *
 * @param {Array}
 * @param {Object}
 * @return {Array}
 * @api private
 */
function decorateDeps(deps, data) {
  var ret = []
    , depMap = data.depMap
    , errorMap = data.errorMap
    , absMap = data.absMap
    , verbose = data.verbose;

  deps.forEach(function (name) {
    var label = name + (errorMap[name] || '') + (absMap[name] || '');

    if (depMap[name] && depMap[name].length) {
      var node = {};
      node.label = label;
      node.nodes = decorateDeps(depMap[name], data);
      ret.push(node);
    } else {
      ret.push(label);
    }
  });

  return ret;
}