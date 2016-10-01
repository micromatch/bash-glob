'use strict';

var glob = require('./');

console.log(glob.sync('**/*.md', {dotglob: true}));
console.log(glob.sync('readme.md', {dotglob: true}));

glob(['*.js', '*.md'], {dot: true}, function(err, files) {
  if (err) return console.log(err);
  console.log(files);
});

