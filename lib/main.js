'use strict';

var _deploy = require('./deploy');

var _resolve = require('./resolve');

if (process.argv.indexOf('deploy') >= 2) {
  (0, _deploy.main)();
} else if (process.argv.indexOf('resolve') >= 2) {
  (0, _resolve.main)();
} else {
  (0, _deploy.main)();
}