'use strict';

var argv = require('minimist')(process.argv.slice(2));
var glob = argv.glob ? require('glob') : require('..');
console.time(argv.glob ? 'glob' : 'bash-glob');

glob('**/*.js', function(err, files) {
  if (err) return console.log(err);
  console.log(files.length);
  console.timeEnd(argv.glob ? 'glob' : 'bash-glob');
});

