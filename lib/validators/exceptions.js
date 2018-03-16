"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ValidationError = function (_Error) {
  (0, _inherits3.default)(ValidationError, _Error);

  function ValidationError() {
    var _ref;

    (0, _classCallCheck3.default)(this, ValidationError);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    // Saving class name in the property of our custom error as a shortcut.
    var _this = (0, _possibleConstructorReturn3.default)(this, (_ref = ValidationError.__proto__ || (0, _getPrototypeOf2.default)(ValidationError)).call.apply(_ref, [this].concat(args)));
    // Calling parent constructor of base Error class.


    _this.name = _this.constructor.name;
    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(_this, ValidationError);
    return _this;
  }

  return ValidationError;
}(Error);

var SystemCheckError = function (_Error2) {
  (0, _inherits3.default)(SystemCheckError, _Error2);

  function SystemCheckError() {
    var _ref2;

    (0, _classCallCheck3.default)(this, SystemCheckError);

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (_ref2 = SystemCheckError.__proto__ || (0, _getPrototypeOf2.default)(SystemCheckError)).call.apply(_ref2, [this].concat(args)));

    _this2.name = _this2.constructor.name;
    Error.captureStackTrace(_this2, SystemCheckError);
    return _this2;
  }

  return SystemCheckError;
}(Error);

module.exports = {
  ValidationError: ValidationError,
  SystemCheckError: SystemCheckError
};