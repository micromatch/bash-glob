'use strict';

var isExtglob = require('is-extglob');
var extend = require('extend-shallow');
var spawn = require('cross-spawn');
var bashPath = process.platform === 'darwin'
  ? '/usr/local/bin/bash'
  : 'bash';

/**
 * Expose `glob`
 */

module.exports = exports = glob;

/**
 * Asynchronously returns an array of files that match the given pattern
 * or patterns.
 *
 * ```js
 * var glob = require('bash-glob');
 * glob(['*.js', '*.md'], {dot: true}, function(err, files) {
 *   if (err) return console.log(err);
 *   console.log(files);
 * });
 * ```
 * @param {String} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` Options to pass to bash. See available [options](#options).
 * @param {Function} `cb` Callback function, with `err` and `files` array.
 * @api public
 */

function glob(patterns, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (typeof cb !== 'function') {
    throw new TypeError('expected callback to be a function');
  }

  if (Array.isArray(patterns)) {
    patterns = patterns.join(' ');
  }

  if (typeof patterns !== 'string') {
    cb(new TypeError('expected glob patterns to be a string or array'));
    return;
  }

  var opts = createOptions(patterns, options);
  var cp = spawn(bashPath, cmd(patterns, opts), opts);
  var buf = new Buffer(0);

  cp.stdout.on('data', function(data) {
    buf = Buffer.concat([ buf, data ]);
  });

  cp.stderr.on('data', function(err) {
    cb(err);
  });

  cp.on('close', function(code) {
    if (code) {
      if (code === 1) {
        cb(null, []);
        return;
      }
      cb(code);
      process.exit(code);
    } else {

      var files = buf.toString()
        .split(/\r?\n/)
        .filter(Boolean);

      cb(null, files);
    }
  });
};

/**
 * Returns an array of files that match the given patterns or patterns.
 *
 * ```js
 * var glob = require('bash-glob');
 * console.log(glob.sync('*.js', {cwd: 'foo'}));
 * console.log(glob.sync(['*.js'], {cwd: 'bar'}));
 * ```
 * @param {String} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` Options to pass to bash. See available [options](#options).
 * @return {Array} Returns an array of files.
 * @api public
 */

glob.sync = function(patterns, options) {
  if (Array.isArray(patterns)) {
    patterns = patterns.join(' ');
  }

  if (typeof patterns !== 'string') {
    throw new TypeError('expected glob patterns to be a string or array');
  }

  var opts = createOptions(patterns, options);
  var cp = spawn.sync(bashPath, cmd(patterns, opts), opts);
  var err = cp.stderr.toString().trim();
  if (err) {
    err.cmd = cmd;
    err.patterns = patterns;
    err.options = opts;
    throw new Error(err);
  }

  return cp.stdout.toString()
    .split(/\r?\n/)
    .filter(Boolean);
};

/**
 * Create the command to use
 */

function cmd(patterns, options) {
  var valid = ['dotglob', 'extglob', 'failglob', 'globstar', 'nocaseglob', 'nullglob'];
  var args = [];
  for (var key in options) {
    if (options.hasOwnProperty(key) && valid.indexOf(key) !== -1) {
      args.push('-O', key);
    }
  }
  args.push('-c', `for i in ${patterns}; do echo $i; done`);
  return args;
}

/**
 * Shallow clone and create options
 */

function createOptions(patterns, options) {
  var opts = extend({}, options);
  if (opts.nocase === true) opts.nocaseglob = true;
  if (opts.dot === true) opts.dotglob = true;
  if (!opts.hasOwnProperty('globstar') && patterns.indexOf('**') !== -1) {
    opts.globstar = true;
  }
  if (!opts.hasOwnProperty('extglob') && isExtglob(patterns)) {
    opts.extglob = true;
  }
  return opts;
}
