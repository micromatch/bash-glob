'use strict';

var glob = require('..');

glob(['**/*.js', '**/*.md'], function(err, files) {
  if (err) return console.log(err);
  console.log(files);
});

