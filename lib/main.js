'use strict';

var _deploy = require('./deploy');

var _resolve = require('./resolve');

var _claimrewards = require('./claimrewards');

if (process.argv.indexOf('deploy') >= 2) {
  (0, _deploy.main)(process.argv);
} else if (process.argv.indexOf('resolve') >= 2) {
  (0, _resolve.main)(process.argv);
} else if (process.argv.indexOf('claimrewards') >= 2) {
  (0, _claimrewards.main)(process.argv);
} else {
  (0, _deploy.main)(process.argv);
}