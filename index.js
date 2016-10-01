'use strict';

var fs = require('fs');
var path = require('path');
var diff = require('arr-diff');
var isGlob = require('is-glob');
var each = require('async-each');
var exists = require('fs-exists-sync');
var spawn = require('cross-spawn');
var isExtglob = require('is-extglob');
var extend = require('extend-shallow');
var Emitter = require('component-emitter');
var bashPath = process.platform === 'darwin'
  ? '/usr/local/bin/bash'
  : 'bash';

/**
 * Asynchronously returns an array of files that match the given pattern
 * or patterns.
 *
 * ```js
 * var glob = require('bash-glob');
 * glob('*.js', function(err, files) {
 *   if (err) return console.log(err);
 *   console.log(files);
 * });
 * ```
 * @param {String} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` Options to pass to bash. See available [options](#options).
 * @param {Function} `cb` Callback function, with `err` and `files` array.
 * @api public
 */

function glob(pattern, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (Array.isArray(pattern)) {
    return glob.each.apply(glob, arguments);
  }

  if (typeof cb !== 'function') {
    throw new TypeError('expected callback to be a function');
  }

  if (typeof pattern !== 'string') {
    cb(new TypeError('expected glob to be a string or array'));
    return;
  }

  var opts = createOptions(pattern, options);
  if (!isGlob(pattern)) {
    var fp = path.resolve(opts.cwd, pattern);

    fs.stat(fp, function(error, stat) {
      var files = [pattern];
      if (error) {
        var err = handleError(error, pattern, opts);
        if (err instanceof Error) {
          glob.emit('files', [], opts.cwd);
          cb(err, []);
          return;
        }
        files = err;
      }
      glob.emit('files', files, opts.cwd);
      cb(null, files);
    });
    return;
  }

  fs.stat(opts.cwd, function(err, stats) {
    if (err) {
      if (err.code === 'ENOENT') {
        var files = opts.nullglob ? [pattern] : [];
        glob.emit('files', files, opts.cwd);
        cb(null, files);
        return;
      }
      cb(err);
      return;
    }

    if (!stats.isDirectory()) {
      cb(new Error('cwd is not a directory: ' + opts.cwd));
      return;
    }

    var cp = spawn(bashPath, cmd(pattern, opts), opts);
    var buf = new Buffer(0);
    cp.stdout.on('data', function(data) {
      var match = getFiles(data.toString(), pattern, opts);
      glob.emit('match', match, opts.cwd);
      buf = Buffer.concat([buf, data]);
    });

    cp.stderr.on('data', function(data) {
      glob.off('files');
      var err = handleError(data.toString(), pattern, opts);
      if (err instanceof Error) {
        cb(err, []);
        return;
      }
      cb(null, err);
    });

    cp.on('close', function(code) {
      if ((code && code === 1) || !buf) {
        cache[key] = [];
        cb(null, []);

      } else if (code) {
        cb(code, []);
        process.exit(code);

      } else {
        var files = getFiles(buf.toString(), pattern, opts);
        if (files instanceof Error) {
          cb(files, []);
          return;
        }

        glob.emit('files', files, opts.cwd);
        if (!opts.each) glob.end(files);
        cb(null, files);
      }
    });
  });

  return glob;
};

/**
 * Asynchronously glob an array of files that match any of the given `patterns`.
 *
 * ```js
 * var glob = require('bash-glob');
 * glob.each(['*.js', '*.md'], {dot: true}, function(err, files) {
 *   if (err) return console.log(err);
 *   console.log(files);
 * });
 * ```
 * @param {String} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` Options to pass to bash. See available [options](#options).
 * @param {Function} `cb` Callback function, with `err` and `files` array.
 * @api public
 */

glob.each = function(patterns, options, cb) {
  if (typeof patterns === 'string') {
    return glob.apply(glob, arguments);
  }

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (typeof cb !== 'function') {
    throw new TypeError('expected callback to be a function');
  }

  if (!Array.isArray(patterns)) {
    cb(new TypeError('expected patterns to be a string or array'));
    return;
  }

  var opts = createOptions(patterns, options);
  var acc = [];

  each(patterns, function(pattern, next) {
    opts.each = true;

    glob(pattern, opts, function(err, files) {
      if (err) {
        next(err);
        return;
      }
      acc.push.apply(acc, files);
      next();
    });
  }, function(err) {
    if (err) {
      cb(err, []);
      return;
    }
    glob.end(acc);
    cb(null, acc);
  });

  return glob;
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

glob.sync = function(pattern, options) {
  if (Array.isArray(pattern)) {
    return pattern.reduce(function(acc, pattern) {
      acc = acc.concat(glob.sync(pattern, options));
      return acc;
    }, []);
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('expected glob to be a string or array');
  }

  var opts = createOptions(pattern, options);
  try {
    var stat = fs.statSync(opts.cwd);
    if (!stat.isDirectory()) {
      throw new Error('cwd is not a directory: ' + opts.cwd);
    }
  } catch (error) {
    var err = handleError(error, pattern, opts, true);
    if (err instanceof Error) {
      throw err;
    }
    return err;
  }

  var cp = spawn.sync(bashPath, cmd(pattern, opts), opts);
  var error = !!cp.stderr ? String(cp.stderr).trim() : null;
  if (error) {
    var err = handleError(error, pattern, opts);
    if (err instanceof Error) {
      throw err;
    }
    return err;
  }

  if (cp.stdout == null) {
    return [];
  }

  var files = getFiles(cp.stdout.toString(), pattern, opts);
  if (files instanceof Error) {
    throw files;
  }

  glob.emit('files', files, opts.cwd);
  glob.end(files);
  return files;
};

glob.end = function(files) {
  glob.emit('end', files);
  glob.off('match');
  glob.off('files');
  glob.off('end');
};

/**
 * Escape spaces in glob patterns
 */

function normalize(val) {
  if (Array.isArray(val)) {
    var len = val.length;
    var idx = -1;
    while (++idx < len) {
      val[idx] = normalize(val[idx]);
    }
    return val.join(' ');
  }
  return val.split(' ').join('\\ ');
}

function resolve(err, stats, pattern, options) {
  if (err) {
    if (err.code === 'ENOENT') {
      return options.nullglob ? [pattern] : [];
    }
    return err;
  }
  if (!stats.isDirectory()) {
    return new Error('cwd is not a directory: ' + options.cwd);
  }
  return [pattern];
}

/**
 * Create the command to use
 */

function cmd(patterns, options) {
  var str = normalize(patterns);
  var valid = ['dotglob', 'extglob', 'failglob', 'globstar', 'nocaseglob', 'nullglob'];
  var args = [];
  for (var key in options) {
    if (options.hasOwnProperty(key) && valid.indexOf(key) !== -1) {
      args.push('-O', key);
    }
  }
  args.push('-c', `for i in ${str}; do echo $i; done`);
  return args;
}

/**
 * Shallow clone and create options
 */

function createOptions(pattern, options) {
  if (options && options.normalized === true) return options;
  var opts = extend({cwd: process.cwd()}, options);
  if (opts.nocase === true) opts.nocaseglob = true;
  if (opts.nonull === true) opts.nullglob = true;
  if (opts.dot === true) opts.dotglob = true;
  if (!opts.hasOwnProperty('globstar') && pattern.indexOf('**') !== -1) {
    opts.globstar = true;
  }
  if (!opts.hasOwnProperty('extglob') && isExtglob(pattern)) {
    opts.extglob = true;
  }
  opts.normalized = true;
  return opts;
}

function handleError(err, pattern, options) {
  if (typeof err === 'string' && /no match:/.test(err)) {
    err = new Error('no matches:' + pattern);
    err.code = 'NOMATCH';
  }
  if (err.code === 'ENOENT' || err.code === 'NOMATCH') {
    if (options.nullglob === true) {
      return [pattern];
    }
    if (options.failglob === true) {
      return err;
    }
    return [];
  }
  return err;
}

function getFiles(res, pattern, options) {
  var files = res.split(/\r?\n/).filter(Boolean);
  if (files.length === 1 && files[0] === pattern) {
    files = [];
  }

  if (options.follow === true) {
    var len = files.length;
    var idx = -1;
    while (++idx < len) {
      try {
        files[idx] = fs.realpathSync(path.join(options.cwd, files[idx]));
      } catch (err) {
        files.splice(idx, 1);
      }
    }
  }

  if (files.length === 0) {
    if (options.nullglob === true) {
      return [pattern];
    }
    if (options.failglob === true) {
      return new Error('no matches:' + pattern);
    }
  }
  return files;
}

Emitter(glob);
glob.cache = {};

/**
 * Expose `glob`
 */

module.exports = exports = glob;
