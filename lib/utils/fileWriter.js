'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _os = require('./os');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FileWriter = function () {
  function FileWriter(filePath, data) {
    var include = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    (0, _classCallCheck3.default)(this, FileWriter);

    this._filePath = filePath;
    this._data = data;
    this._include = include;
  }

  (0, _createClass3.default)(FileWriter, [{
    key: 'setData',
    value: function setData(data) {
      this._data = data;
    }
  }, {
    key: 'setFilePath',
    value: function setFilePath(filePath) {
      this._filePath = filePath;
    }

    /**
    * Writes JSON data to a file.
    * Can merge current `this._data` with file content if `this._include` is true
    * @throws Error
    */

  }, {
    key: 'write',
    value: function write() {
      var data = {};

      if ((0, _os.fileExists)(this._filePath) && this._include) {
        // read file content
        data = (0, _os.readFile)(this._filePath);
      }

      if (this._include) {
        // include data
        data = (0, _assign2.default)(data, this._data);
      } else {
        data = this._data;
      }
      // write
      (0, _os.writeFile)(this._filePath, (0, _stringify2.default)(data, null, 2));
    }

    /**
    * Removes the current `this._filePath` file from disk
    */

  }, {
    key: 'remove',
    value: function remove() {
      (0, _os.removeFile)(this._filePath);
    }
  }]);
  return FileWriter;
}();

module.exports = FileWriter;