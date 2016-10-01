'use strict';

var isWindows = process.platform === 'win32';
var fs = require('fs');
var path = require('path');
var each = require('async-each');
var assert = require('assert');
var mkdirp = require('mkdirp');
var glob = require('..');

var cwd = process.cwd();

var link = 'fixtures/a/broken-link/link';
var patterns = [
  'fixtures/a/broken-link/*',
  'fixtures/a/broken-link/**',
  'fixtures/a/broken-link/**/link',
  'fixtures/a/broken-link/**/*',
  'fixtures/a/broken-link/link',
  'fixtures/a/broken-link/{link,asdf}',
  'fixtures/a/broken-link/+(link|asdf)',
  'fixtures/a/broken-link/!(asdf)'
];

var options = [
  null,
  {nonull: true },
  {mark: true },
  {stat: true },
  {follow: true }
];

describe('set up broken symlink', function() {
  before('set up broken symlink', function(cb) {
    process.chdir(__dirname);
    cleanup();
    mkdirp.sync('fixtures/a/broken-link');
    fs.symlinkSync('this-does-not-exist', 'fixtures/a/broken-link/link');
    cb();
  });

  after('cleanup', function(cb) {
    cleanup();
    process.chdir(cwd);
    cb();
  });

  describe('async test', function() {
    patterns.forEach(function(pattern) {
      it(pattern, function(cb) {
        if (isWindows) {
          this.skip();
          return;
        }

        each(options, function(opts, next) {
          glob(pattern, opts, function(err, files) {
            if (err) return next(err);
            var msg = pattern + ' options=' + JSON.stringify(opts);
            if (opts && opts.follow === true) {
              assert.equal(files.indexOf(link), -1, msg);
            } else if (pattern !== link || (opts && opts.nonull)) {
              assert.notEqual(files.indexOf(link), -1, msg);
            } else {
              assert(!files.length);
            }
            next();
          });
        }, cb);
      });
    });
  });

  describe('sync test', function() {
    patterns.forEach(function(pattern) {
      it(pattern, function() {
        if (isWindows) {
          this.skip();
          return;
        }

        options.forEach(function(opts) {
          var files = glob.sync(pattern, opts);
          var msg = pattern + ' options=' + JSON.stringify(opts);

          if (opts && opts.follow === true) {
            assert.equal(files.indexOf(link), -1, msg);
          } else if (pattern !== link || (opts && opts.nonull)) {
            assert.notEqual(files.indexOf(link), -1, msg);
          } else {
            assert(!files.length);
          }
        });
      });
    });
  });
});

function cleanup() {
  try {
    fs.unlinkSync(path.resolve(__dirname, 'fixtures/a/broken-link/link'));
  } catch (e) {}
  try {
    fs.rmdirSync(path.resolve(__dirname, 'fixtures/a/broken-link'));
  } catch (e) {}
}
