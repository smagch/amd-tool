var amd = require('../lib/amd')
  , expect = require('expect.js')
  , path = require('path')
  , resolve = path.resolve
  , testConfig = {
      baseUrl: './test/fixtures'
    }
  , testDir = resolve(__dirname, 'fixtures')
  , simpleDir = resolve(testDir, 'simple');
