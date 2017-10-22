'use strict';

var glob = require('..');

glob.on('files', function(files) {
  console.log(files);
});

glob.promise(['**/*.js', '**/*.md'])
  .then(null, console.error)

