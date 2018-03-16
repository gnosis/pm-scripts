'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _constants = require('../utils/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BaseValidator = function () {
  function BaseValidator() {
    (0, _classCallCheck3.default)(this, BaseValidator);
  }

  (0, _createClass3.default)(BaseValidator, [{
    key: 'isString',

    /**
    * Validators
    */

    value: function isString(value) {
      return typeof value === 'string';
    }
  }, {
    key: 'numberRequired',
    value: function numberRequired(value) {
      try {
        return value !== undefined && value !== null && parseFloat(value);
      } catch (err) {
        return false;
      }
    }
  }, {
    key: 'futureDate',
    value: function futureDate(value) {
      var date = void 0;
      if (!(value instanceof Date)) {
        date = new Date(value);
      } else {
        date = value;
      }

      var futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(0, 0, 0, 0);
      return date >= futureDate;
    }
  }, {
    key: 'arrayRequired',
    value: function arrayRequired(value, minlength) {
      return value !== undefined && value !== null && value.length >= minlength;
    }
  }, {
    key: 'required',
    value: function required(value) {
      return value !== null && value !== undefined && value.trim().length > 0;
    }
  }, {
    key: 'requiredEthAddress',
    value: function requiredEthAddress(value) {
      return this.required(value) && value.trim().length === _constants.ETH_ADDRESS_LENGTH;
    }
  }, {
    key: 'httpUrl',
    value: function httpUrl(value) {
      var webUrlRegex = '(https?):\/\/?[^\s(["<,>]*\.[^\s[",><]*:[0-9]*';
      var regexResult = value.match(webUrlRegex);
      return this.required(value) && regexResult !== null && regexResult.length > 0;
    }
  }, {
    key: 'httpObject',
    value: function httpObject(httpObj) {
      return this.required(httpObj.protocol) && this.required(httpObj.host) && this.required(httpObj.port);
    }
  }, {
    key: 'objectPropertiesRequired',
    value: function objectPropertiesRequired(obj) {
      var properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      var isValid = true;
      if (obj !== null && obj !== undefined) {
        if (properties.length > 0) {
          for (var x in properties) {
            if (obj[properties[x]] === undefined || obj[properties[x]] === '') {
              isValid = false;
              break;
            }
          }
        }
      } else {
        isValid = false;
      }
      return isValid;
    }
  }]);
  return BaseValidator;
}();

module.exports = BaseValidator;