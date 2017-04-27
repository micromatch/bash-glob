'use strict';

var cwd = process.cwd();
var isWindows = process.platform === 'win32';
var argv = require('minimist')(process.argv.slice(2));
var extend = require('extend-shallow');
var assert = require('assert');
var path = require('path');
var glob = argv.glob ? require('glob') : require('..');

// pattern to find a bunch of duplicates
var fallback = 'a/symlink{,/*,/*/*}';
var fixtures = path.resolve(__dirname, 'fixtures');

// options, results
// realpath:true set on each option
var cases = [
  [{}, ['a/symlink', 'a/symlink/a', 'a/symlink/a/b']],
  [{mark: true}, ['a/symlink/', 'a/symlink/a/', 'a/symlink/a/b/']],
  [{stat: true}, ['a/symlink', 'a/symlink/a', 'a/symlink/a/b']],
  [{follow: true}, ['a/symlink', 'a/symlink/a', 'a/symlink/a/b']],
  [{cwd: 'a'}, ['symlink', 'symlink/a', 'symlink/a/b'], fallback.substr(2)],
  [{cwd: 'a'}, [], 'no one here but us chickens'],
  [{nonull: true},
    ['no one here but us {chickens,sheep}'],
    'no one here but us {chickens,sheep}'
  ],
  [{mark: true},
    ['a/symlink/',
      'a/symlink/a/',
      'a/symlink/a/b/'
    ]
  ],
  [{mark: true, follow: true},
    ['a/symlink/',
      'a/symlink/a/',
      'a/symlink/a/b/'
    ]
  ]
];

describe('options.realpath', function() {
  before(function() {
    process.chdir(path.join(__dirname, 'fixtures'));
  });

  after(function() {
    process.chdir(cwd);
  });

  describe('options', function() {
    cases.forEach(function(unit) {
      var options = extend({}, unit[0]);
      var expected = unit[1];

      if (!(options.nonull && expected[0].match(/^no one here/))) {
        expected = expected.map(function(fp) {
          var cwd = options.cwd ? path.resolve(fixtures, options.cwd) : fixtures;
          fp = path.resolve(cwd, fp);
          return fp.replace(/\\/g, '/');
        });
      }

      var pattern = unit[2] || fallback;
      options.realpath = true;

      it('sync: ' + JSON.stringify(options), function() {
        if (isWindows) return this.skip();
        var files = glob.sync(pattern, options);
        assert.deepEqual(files, expected, 'sync: ' + expected);
      });

      it('async: ' + JSON.stringify(options), function(cb) {
        if (isWindows) return this.skip();

        glob(pattern, options, function(err, files) {
          if (err) return cb(err);
          assert.deepEqual(files, expected, 'async: ' + expected);
          cb();
        });
      });
    });
  });
});
