'use strict';

var glob = require('..');

console.log(glob.sync('*.md', {dotglob: true}));
console.log(glob.sync('readme.md'));
