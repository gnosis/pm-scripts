'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _constants = require('../utils/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var moment = require('moment');

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
        return value !== undefined && value !== null && parseFloat(value) !== undefined;
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
    key: 'validDate',
    value: function validDate(value) {
      var validFormats = ['YYYY-MM-DD HH:mm:ss', // '2006-10-25 14:30:59'
      'YYYY-MM-DD HH:mm:ss.SSS', // '2006-10-25 14:30:59.000200'
      'YYYY-MM-DDTHH:mm:ss.SSSZ', // 2018-12-31T18:00:00.000Z
      'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DD HH:mm', // '2006-10-25 14:30'
      'YYYY-MM-DD', // '2006-10-25'
      'MM/DD/YYYY HH:mm:ss', // '10/25/2006 14:30:59'
      'MM/DD/YYYY HH:mm:ss.fff', // '10/25/2006 14:30:59.000200'
      'MM/DD/YYYY HH:mm', // '10/25/2006 14:30'
      'MM/DD/YYYY', // '10/25/2006'
      'MM/DD/YYYY HH:mm:ss', // '10/25/06 14:30:59'
      'MM/DD/YY HH:mm:ss.fff', // '10/25/06 14:30:59.000200'
      'MM/DD/YY HH:mm', // '10/25/06 14:30'
      'MM/DD/YY'];

      var isValid = false;
      for (var idx in validFormats) {
        isValid = moment(value, validFormats[idx], true).isValid();
        if (isValid) {
          break;
        }
      }
      return isValid;
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