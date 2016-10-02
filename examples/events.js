'use strict';

var glob = require('./');
glob.on('match', function(match, cwd) {
  console.log(cwd, match);
});

// console.log(glob.sync('**/*.md', {dotglob: true}));
console.log(glob.sync('readme.md', {dotglob: true, nocase: true}));

// glob.sync('**/*.md', {dotglob: true});
// glob.sync('readme.md', {dotglob: true});

// console.log(glob.cache)

// glob('slslls', {dot: true, nonull: true}, function(err, files) {
//   if (err) return console.log(err);
//   console.log(files);
// });

// glob('*.asfkasjks', {dot: true}, function(err, files) {
//   if (err) return console.log(err);
//   console.log(files);
// });

