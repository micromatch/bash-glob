'use strict';

var cwd = process.cwd();
var isWindows = process.platform === 'win32';
var unique = require('array-unique');
var assert = require('assert');
var path = require('path');
var glob = require('..');

describe('files event', function() {
  before(function() {
    process.chdir(path.join(__dirname, 'fixtures'));
  });

  after(function() {
    process.chdir(cwd);
  });

  it('should not return duplicate matches', function(cb) {
    var pattern = ['a/**/[gh]', 'a/**/[a-z]'];
    var matches = [];

    glob.on('files', function(files) {
      matches.push.apply(matches, files);
    });

    glob.on('end', function(files) {
      matches = matches.sort();
      files = files.sort();
      assert.deepEqual(unique(files), files, 'should have same files of matches');
      assert.deepEqual(matches, files, 'should have same files of matches');
      cb();
    });

    glob.sync(pattern);
  });
});
