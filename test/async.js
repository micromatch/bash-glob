'use strict';

require('mocha');
var del = require('delete');
var path = require('path');
var fixtures = path.join(__dirname, 'fixtures');
var symlinks = require('./support/symlinks');
var setup = require('./support/setup');
var home = require('./support/home');

var files = [
  'a/.abcdef/x/y/z/a',
  'a/abcdef/g/h',
  'a/abcfed/g/h',
  'a/b/c/d',
  'a/bc/e/f',
  'a/c/d/c/b',
  'a/cb/e/f',
  'a/x/.y/b',
  'a/z/.y/b'
];

describe('async', function() {
  describe('setup', function() {
    it('should remove fixtures', function(cb) {
      del(fixtures, function(err) {
        if (err) return cb(err);
        del('/tmp/glob-test', {force: true}, cb);
      });
    });

    it('should create test fixtures', function(cb) {
      setup(files, fixtures, cb);
    });

    it('should setup symlinks', function(cb) {
      symlinks(fixtures, cb);
    });

    it('should setup fixtures in user home', function(cb) {
      home(['foo', 'bar', 'baz', 'asdf', 'quux', 'qwer', 'rewq'], cb);
    });
  });
});
