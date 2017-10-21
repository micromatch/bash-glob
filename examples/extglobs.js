'use strict';

var path = require('path');
var argv = require('minimist')(process.argv.slice(2));
var glob = argv.glob ? require('glob') : require('..');
console.time(argv.glob ? 'glob' : 'bash-glob');

var files = glob.sync('!(*.*).!(*.*)', {cwd: path.join(__dirname, 'fixtures')});
console.log(files);
console.log(files.length);
console.timeEnd(argv.glob ? 'glob' : 'bash-glob');
