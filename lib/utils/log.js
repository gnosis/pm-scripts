'use strict';

var prefix = '[Gnosis SDK]';
var logError = function logError(message) {
  console.error(prefix + ' \x1B[31m' + message + ' \x1B[0m');
};

var logSuccess = function logSuccess(message) {
  console.info(prefix + ' \x1B[32m' + message + ' \x1B[0m');
};

var logWarn = function logWarn(message) {
  console.warn(prefix + ' \x1B[33m' + message + ' \x1B[0m');
};

var logInfo = function logInfo(message) {
  console.warn(prefix + ' ' + message);
};

module.exports = {
  logInfo: logInfo,
  logError: logError,
  logSuccess: logSuccess,
  logWarn: logWarn
};