'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hasWriteDirectoryPerms = function hasWriteDirectoryPerms(directory) {
  try {
    _fs2.default.accessSync(directory, _fs2.default.constants.R_OK | _fs2.default.constants.W_OK);
    return true;
  } catch (error) {
    return false;
  }
};

var fileExists = function fileExists(filePath) {
  try {
    return _fs2.default.existsSync(filePath);
  } catch (error) {
    return false;
  }
};

var readFile = function readFile(filePath) {
  var data = _fs2.default.readFileSync(filePath, 'utf8');
  // If file is empty, returns an empty object
  if (data === undefined || data === null || data.trim() === '') {
    return {};
  }
  return JSON.parse(data);
};

var writeFile = function writeFile(filePath, data) {
  _fs2.default.writeFileSync(filePath, data, 'utf8');
};

var removeFile = function removeFile(filePath) {
  _fs2.default.unlinkSync(filePath);
};

module.exports = {
  hasWriteDirectoryPerms: hasWriteDirectoryPerms,
  fileExists: fileExists,
  readFile: readFile,
  writeFile: writeFile,
  removeFile: removeFile
};