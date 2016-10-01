'use strict';

var cwd = process.cwd();
var util = require('util');
var assert = require('assert');
var glob = require('..');

// [pattern, options, expected]
var cases = [
  ['a/*NOFILE*/**/', {}, []],
  ['a/*NOFILE*/**/', {nonull: true}, ['a/*NOFILE*/**/']],
  ['*/*', {cwd: 'NODIR'}, []],
  ['*/*', {cwd: 'NODIR', nonull: true}, ['*/*']],
  ['NOFILE', {}, []],
  ['NOFILE', {nonull: true}, ['NOFILE']],
  ['NOFILE', {cwd: 'NODIR'}, []],
  ['NOFILE', {cwd: 'NODIR', nonull: true}, ['NOFILE']]
];

describe('options.nonull', function() {
  before(function() {
    process.chdir(__dirname);
  });

  after(function() {
    process.chdir(cwd);
  });

  cases.forEach(function(ele) {
    var options = Object.assign({}, ele[1]);
    var pattern = ele[0];
    var expected = ele[2].sort();

    it(pattern + ' ' + util.inspect(options), function(cb) {
      var files = glob.sync(pattern, options).sort();
      assert.deepEqual(files, expected, 'sync results');

      glob(pattern, options, function(err, files) {
        if (err) return cb(err);
        files = files.sort();
        assert.deepEqual(files, expected, 'async results');
        cb();
      });
    });
  });
});
