'use strict';

var cwd = process.cwd();
var isWindows = process.platform === 'win32';
var assert = require('assert');
var path = require('path');
var glob = require('..');

describe('options.follow', function() {
  before(function() {
    process.chdir(path.join(__dirname, 'fixtures'));
  });

  after(function() {
    process.chdir(cwd);
  });

  it('async: should follow symlinks', function(cb) {
    if (isWindows) return this.skip();

    var pattern = 'a/symlink/**';
    var followSync = glob.sync(pattern, { follow: true }).sort();
    var noFollowSync = glob.sync(pattern).sort();

    assert.notDeepEqual(followSync, noFollowSync, 'followSync should not equal noFollowSync');

    glob(pattern, { follow: true }, function(err, files) {
      if (err) throw err;
      var follow = files.sort();

      glob(pattern, function(err, files) {
        if (err) throw err;
        var noFollow = files.sort();

        assert.deepEqual(noFollow, noFollowSync, 'sync and async noFollow should match');
        assert.notDeepEqual(follow, noFollow, 'follow should not equal noFollow');

        var long = path.resolve('a/symlink/a/b');
        assert.deepEqual(follow, followSync, 'sync and async follow should match');
        assert.notEqual(follow.indexOf(long), -1, 'follow should have long entry');
        assert.notEqual(followSync.indexOf(long), -1, 'followSync should have long entry');
        cb();
      });
    });
  });

  it('promise: should follow symlinks', function() {
    if (isWindows) return this.skip();

    var pattern = 'a/symlink/**';
    var followSync = glob.sync(pattern, { follow: true }).sort();
    var noFollowSync = glob.sync(pattern).sort();

    assert.notDeepEqual(followSync, noFollowSync, 'followSync should not equal noFollowSync');

    return glob(pattern, { follow: true })
      .then(function(files) {
        var follow = files.sort();

        return glob(pattern)
          .then(function(files) {
            var noFollow = files.sort();

            assert.deepEqual(noFollow, noFollowSync, 'sync and async noFollow should match');
            assert.notDeepEqual(follow, noFollow, 'follow should not equal noFollow');

            var long = path.resolve('a/symlink/a/b');
            assert.deepEqual(follow, followSync, 'sync and async follow should match');
            assert.notEqual(follow.indexOf(long), -1, 'follow should have long entry');
            assert.notEqual(followSync.indexOf(long), -1, 'followSync should have long entry');
          });
    })
  });
});
