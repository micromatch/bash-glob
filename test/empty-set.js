'use strict';

var assert = require('assert');
var glob = require('..');

// Patterns that cannot match anything
var patterns = [
  '# comment',
  ' ',
  '\n',
  'just doesnt happen to match anything so this is a control'
];

describe('empty sets', function() {
  patterns.forEach(function(pattern) {
    it(JSON.stringify(pattern), function(cb) {
      glob(pattern, function(err, files) {
        if (err) return cb(err);
        assert.deepEqual(files, [], 'expected an empty array');
        cb();
      });
    });
  });
});
