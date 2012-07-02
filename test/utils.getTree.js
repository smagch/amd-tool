var amd = require('../lib/amd')
  , utils = require('../lib/utils')
  , expect = require('expect.js')
  , path = require('path')
  , resolve = path.resolve
  , depMap = {
      a: ['b', 'c', 'd'],
      b: ['c', 'd'],
      c: ['d'],
      d: []
    }
  , _tree = {
      label: 'a',
      nodes: [
        {
          label: 'b',
          nodes: [
            {
              label: 'c',
              nodes: ['d']
            },
            'd'
          ]
        },
        {
          label: 'c',
          nodes: ['d']
        },
        'd'
      ]
    }

describe('util.getTree', function () {
  it('should return archy formatted Object', function (done) {
    var tree = utils.getTree('a', depMap);
    expect(tree).to.eql(_tree);
    done();
  });
});  