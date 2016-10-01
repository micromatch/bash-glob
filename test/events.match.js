'use strict';

var cwd = process.cwd();
var isWindows = process.platform === 'win32';
var unique = require('array-unique');
var union = require('arr-union');
var assert = require('assert');
var path = require('path');
var glob = require('..');

describe('match event', function() {
  before(function() {
    process.chdir(path.join(__dirname, 'fixtures'));
  });

  after(function() {
    process.chdir(cwd);
  });

  it('should not return duplicate matches', function(cb) {
    var pattern = ['a/**/[gh]', 'a/**/[a-z]'];
    var matches = [];
    var count = 0;

    glob.on('match', function(files) {
      union(matches, files);
    });

    glob.once('end', function(files) {
      matches = matches.sort();
      files = files.sort();
      assert.deepEqual(unique(files), files, 'should have same files of matches');
      assert.deepEqual(matches, files, 'should have same files of matches');
      count++;
    });

    glob(pattern, function(err, files) {
      if (err) return cb(err);
      assert.equal(count, 1);
      assert.deepEqual(unique(files), files, 'should have same files of matches');
      assert.deepEqual(matches, files, 'should have same files of matches');
      cb();
    });
  });
});
