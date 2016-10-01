'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var del = require('delete');

module.exports = function(cwd, cb) {
  if (process.platform !== 'win32') {
    del(path.join(cwd, 'a/symlink'), function(err) {
      if (err) return cb(err);
      var symlinkTo = path.resolve(cwd, 'a/symlink/a/b/c');
      mkdirp(path.dirname(symlinkTo), '0755', function(err) {
        if (err) return cb(err);
        fs.symlinkSync('../..', symlinkTo, 'dir');
        cb();
      });
    });
  } else {
    cb();
  }
};
