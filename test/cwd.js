'use strict';

var tap = require('tap');

var path = require('path');
var isAbsolute = require('is-absolute');
var fixtures = path.join(__dirname, 'fixtures');
var origCwd = process.cwd();
var glob = require('../');

function cacheCheck(globCache) {
  // verify that path cache keys are all absolute
  var keys = ['cache', 'statCache', 'symlinks'];
  keys.forEach(function(key) {
    Object.keys(globCache[key]).forEach(function(filepath) {
      assert.ok(isAbsolute(filepath), filepath + ' should be absolute');
    });
  });
}

describe('changing cwd and searching for **/d', function() {
  before(function(cb) {
    process.chdir(fixtures);
    cb();
  });
  after(function(cb) {
    process.chdir(origCwd);
    cb();
  });

  it('.', function(cb) {
    var g = glob('**/d', function(err, files) {
      if (err) return cb(err);
      assert.deepEqual(files, ['a/b/c/d', 'a/c/d']);
      cacheCheck(g);
      cb();
    });
  });

  it('a', function(cb) {
    var g = glob('**/d', {cwd: path.resolve('a')}, function(err, files) {
      if (err) return cb(err);
      assert.deepEqual(files, ['b/c/d', 'c/d']);
      cacheCheck(g);
      cb();
    });
  });

  it('a/b', function(cb) {
    var g = glob('**/d', {cwd: path.resolve('a/b')}, function(err, files) {
      if (err) return cb(err);
      assert.deepEqual(files, ['c/d']);
      cacheCheck(g);
      cb();
    });
  });

  it('a/b/', function(cb) {
    var g = glob('**/d', {cwd: path.resolve('a/b/')}, function(err, files) {
      if (err) return cb(err);
      assert.deepEqual(files, ['c/d']);
      cacheCheck(g);
      cb();
    });
  });

  it('.', function(cb) {
    var g = glob('**/d', {cwd: process.cwd()}, function(err, files) {
      if (err) return cb(err);
      assert.deepEqual(files, ['a/b/c/d', 'a/c/d']);
      cacheCheck(g);
      cb();
    });
  });
});

// describe('non-dir cwd should raise error', function() {
//   var notdir = 'a/b/c/d';
//   var notdirRE = /a[\\\/]b[\\\/]c[\\\/]d/;
//   var abs = path.resolve(notdir);
//   var expect = new Error('ENOTDIR invalid cwd ' + abs);
//   expect.code = 'ENOTDIR';
//   expect.path = notdirRE;
//   expect.stack = undefined;
//   var msg = 'raise error when cwd is not a dir';

//   t.throws(function() {
//     glob.sync('*', {
//       cwd: notdir
//     });
//   }, expect);
//   glob('*', {
//     cwd: notdir
//   }, function(err, results) {
//     t.match(err, expect);
//     cb();
//   });
// });
