'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var each = require('async-each');
var del = require('delete');

module.exports = function(files, cwd, cb) {
  del(cwd, function(err) {
    if (err) return cb(err);

    each(files, function(filename, next) {
      var filepath = path.resolve(cwd, filename);

      mkdirp(path.dirname(filepath), '0755', function(err) {
        if (err) return next(err);

        fs.writeFile(filepath, 'contents', next);
      });
    }, cb);
  });
};
