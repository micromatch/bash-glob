'use strict';

var isWindows = process.platform === 'win32';
var fs = require('fs');
var path = require('path');
var util = require('util');
var assert = require('assert');
var each = require('async-each');
var mkdirp = require('mkdirp');
var glob = require('..');

var origCwd = process.cwd();
var fixtures = path.join(__dirname, 'fixtures');
var link = path.join(fixtures, 'a/broken-link/link');
var linkDir = path.dirname(link);

var patterns = [
  'a/broken-link/*',
  'a/broken-link/**',
  'a/broken-link/**/link',
  'a/broken-link/**/*',
  'a/broken-link/link',
  'a/broken-link/{link,asdf}',
  'a/broken-link/+(link|asdf)',
  'a/broken-link/!(asdf)'
];

var options = [
  null,
  {nonull: true},
  {mark: true},
  {stat: true},
  {follow: true}
];

function cleanup() {
  try {
    fs.unlinkSync(link);
  } catch (err) {}
  try {
    fs.rmdirSync(linkDir);
  } catch (err) {}
}

describe('broken symlinks', function() {
  beforeEach(function(cb) {
    cleanup();
    mkdirp.sync(linkDir);
    fs.symlinkSync('this-does-not-exist', link);
    process.chdir(fixtures);
    cb();
  });

  afterEach(function(cb) {
    cleanup();
    process.chdir(origCwd);
    cb();
  });

  describe('async support', function() {
    it('should async globbing', function(done) {
      each(patterns, function(pattern, cb) {
        each(options, function(opts, next) {
          glob(path.resolve(fixtures, pattern), opts, function(err, files) {
            if (err) return next(err);
            var msg = pattern + ' ' + JSON.stringify(opts);
            assert.notEqual(files.indexOf(link), -1, msg);
            next();
          });
        }, cb);
      }, done);
    });
  });

  describe('sync support', function() {
    patterns.forEach(function(pattern) {
      describe(pattern, function() {
        options.forEach(function(opts) {
          var optsString = 'options = ' + util.inspect(opts, {depth: null});
          it(optsString, function() {
            var files = glob.sync(path.resolve(fixtures, pattern), opts);
            assert.notEqual(files.indexOf(link), -1, optsString);
          });
        });
      });
    });
  });
});
