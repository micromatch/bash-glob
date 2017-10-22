'use strict';

var isWindows = process.platform === 'win32';
var fs = require('fs');
var each = require('each-parallel-async');
var assert = require('assert');
var mkdirp = require('mkdirp');
var del = require('delete');
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
  before(function(cb) {
    process.chdir(__dirname);
    cleanup();
    mkdirp.sync('fixtures/a/broken-link');
    fs.symlink('this-does-not-exist', 'fixtures/a/broken-link/link', cb);
  });

  after(function(cb) {
    cleanup();
    process.chdir(cwd);
    cb();
  });

  describe('async', function() {
    patterns.forEach(function(pattern) {
      it(pattern, function(cb) {
        if (isWindows) {
          this.skip();
          return;
        }

        each(options, function(opts, next) {
          glob(pattern, opts, function(err, files) {
            if (err) {
              next(err);
              return;
            }

            var msg = pattern + ' options=' + JSON.stringify(opts);
            if (opts && opts.follow === true) {
              assert.equal(files.indexOf(link), -1, msg);
            } else if (pattern !== link || (opts && opts.nonull)) {
              assert.notEqual(files.indexOf(link), -1, msg);
            } else {
              assert(!files.length);
            }

            setImmediate(next);
          });
        }, cb);
      });
    });
  });

  describe('promise - implied (no callback)', function() {
    patterns.forEach(function(pattern) {
      it(pattern, function(cb) {
        if (isWindows) {
          this.skip();
          return;
        }

        each(options, function(opts, next) {
          glob(pattern, opts)
            .then(function(files) {
              var msg = pattern + ' options=' + JSON.stringify(opts);
              if (opts && opts.follow === true) {
                assert.equal(files.indexOf(link), -1, msg);
              } else if (pattern !== link || (opts && opts.nonull)) {
                assert.notEqual(files.indexOf(link), -1, msg);
              } else {
                assert(!files.length);
              }
              setImmediate(next);
            })
            .catch(next);
        }, cb);
      });
    });
  });

  describe('promise - explicit', function() {
    patterns.forEach(function(pattern) {
      it(pattern, function(cb) {
        if (isWindows) {
          this.skip();
          return;
        }

        each(options, function(opts, next) {
          glob.promise(pattern, opts)
            .then(function(files) {
              var msg = pattern + ' options=' + JSON.stringify(opts);
              if (opts && opts.follow === true) {
                assert.equal(files.indexOf(link), -1, msg);
              } else if (pattern !== link || (opts && opts.nonull)) {
                assert.notEqual(files.indexOf(link), -1, msg);
              } else {
                assert(!files.length);
              }
              setImmediate(next);
            })
            .catch(next);
        }, cb);
      });
    });
  });

  describe('sync', function() {
    patterns.forEach(function(pattern) {
      it(pattern, function() {
        if (isWindows) {
          this.skip();
          return;
        }

        options.forEach(function(opts) {
          try {
            var files = glob.sync(pattern, opts);
          } catch (err) {
            console.log(err);
          }
          var msg = pattern + ' options=' + JSON.stringify(opts);

          if (opts && opts.follow === true) {
            assert.equal(files.indexOf(link), -1, msg);
          } else if (pattern !== link || (opts && opts.nonull)) {
            assert(files.indexOf(link) !== -1, msg);
          } else {
            assert(!files.length);
          }
        });
      });
    });
  });
});

function cleanup() {
  del.sync('fixtures/a/broken-link');
}
