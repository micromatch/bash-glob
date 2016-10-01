'use strict';

require('mocha');
var assert = require('assert');
var glob = require('..');

describe('bash-glob', function() {
  describe('API', function() {
    it('should export an function', function() {
      assert(glob);
      assert.equal(typeof glob, 'function');
    });

    it('should export a `.sync` method', function() {
      assert.equal(typeof glob.sync, 'function');
    });
  });

  describe('async: errors', function() {
    it('should throw an error when a callback is not passed', function(cb) {
      try {
        glob();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'expected callback to be a function');
        cb();
      }
    });

    it('should throw an error when invalid glob is passed', function(cb) {
      glob(null, function(err, files) {
        assert.equal(err.message, 'expected glob to be a string or array');
        cb();
      });
    });
  });

  describe('sync: errors', function() {
    it('should throw an error when invalid glob is passed', function(cb) {
      try {
        glob.sync();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'expected glob to be a string or array');
        cb();
      }
    });
  });
});
