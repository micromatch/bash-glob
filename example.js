'use strict';

// var glob = require('glob');
var glob = require('./');
// glob.on('files', function(files, cwd) {
//   // console.log(cwd, files);
// });

// console.log(glob.sync('**/*.md', {dotglob: true}));
// console.log(glob.sync('readme.md', {dotglob: true}));

// glob.sync('**/*.md', {dotglob: true});
// glob.sync('readme.md', {dotglob: true});

// console.log(glob.cache)

// glob('slslls', {dot: true, nonull: true}, function(err, files) {
//   if (err) return console.log(err);
//   console.log(files);
// });

glob('*.md', {dot: true, nonull: true}, function(err, files) {
  if (err) return console.log(err);
  console.log(files);
});

