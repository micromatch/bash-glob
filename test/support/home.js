'use strict';

var path = require('path');
var mkdirp = require('mkdirp');
var each = require('each-parallel-async');

module.exports = function(names, cwd, cb) {
  if (typeof cwd === 'function') {
    cb = cwd;
    cwd = '/tmp/glob-test';
  }

  each(names, function(name, next) {
    mkdirp(path.resolve(cwd, name), next);
  }, cb);
};
