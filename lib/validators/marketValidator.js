'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseValidator = require('./baseValidator');

var _baseValidator2 = _interopRequireDefault(_baseValidator);

var _exceptions = require('./exceptions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MarketValidator = function (_BaseValidator) {
  (0, _inherits3.default)(MarketValidator, _BaseValidator);

  function MarketValidator(marketObject) {
    (0, _classCallCheck3.default)(this, MarketValidator);

    var _this = (0, _possibleConstructorReturn3.default)(this, (MarketValidator.__proto__ || (0, _getPrototypeOf2.default)(MarketValidator)).call(this));

    _this._market = marketObject;
    return _this;
  }

  /**
  * @return True if the configuration if valid, throws an error otherwise
  * @throws Error
  */


  (0, _createClass3.default)(MarketValidator, [{
    key: 'isValid',
    value: function isValid() {
      var errors = [];
      var prefix = '[Market Validation] ';

      if (!this.required(this._market.title)) {
        errors.push(prefix + ' Title is required, got ' + this._market.title);
      }
      if (!this.required(this._market.description)) {
        errors.push(prefix + ' Description is required, got ' + this._market.description);
      }
      if (!this.futureDate(this._market.resolutionDate)) {
        errors.push(prefix + ' ResolutionDate is required and must be greater than today, got ' + this._market.resolutionDate);
      }
      if (!this.required(this._market.outcomeType)) {
        errors.push(prefix + ' OutcomeType is required, accepted values: \'SCALAR\', \'CATEGORICAL\', got ' + this._market.outcomeType);
      }
      if (!this.validFee(this._market.fee)) {
        errors.push(prefix + ' Fee is required, got ' + this._market.fee);
      }
      if (!this.numberRequired(this._market.funding)) {
        errors.push(prefix + ' Funding is required, got ' + this._market.funding);
      } else {
        if (!parseFloat(this._market.funding) > 0) {
          errors.push(prefix + ' Funding is must be greater than 0, got ' + this._market.funding);
        }
      }

      if (this._market.outcomeType === 'SCALAR') {
        if (!this.required(this._market.unit)) {
          errors.push(prefix + ' Unit is required, got ' + this._market.unit);
        }
        if (this._market.decimals === undefined || this._market.decimals === null || this._market.decimals < 0) {
          errors.push(prefix + ' Decimals is required and must be >= 0, got ' + this._market.decimals);
        }
        if (!this.numberRequired(this._market.upperBound)) {
          errors.push(prefix + ' UpperBound is required, got ' + this._market.upperBound);
        }
        if (!this.numberRequired(this._market.lowerBound)) {
          errors.push(prefix + ' LowerBound is required, got ' + this._market.lowerBound);
        }
        if (parseInt(this._market.upperBound) <= parseInt(this._market.lowerBound)) {
          errors.push(prefix + ' UpperBound must be greater than LowerBound');
        }
      } else if (this._market.outcomeType === 'CATEGORICAL') {
        if (!this.arrayRequired(this._market.outcomes, 2)) {
          errors.push(prefix + ' Outcomes is required and must have length 2 at least, got ' + this._market.outcomes);
        }
      } else {
        errors.push(prefix + ' Market of type ' + this._market.outcomeType + ' not supported');
      }

      if (errors.length > 0) {
        var stringError = errors.reduce(function (e, s) {
          return e + '\n' + s;
        }, '');
        throw new _exceptions.ValidationError(stringError);
      }
      return true;
    }

    /**
    * Custom validators
    */

  }, {
    key: 'validFee',
    value: function validFee(fee) {
      try {
        return fee !== undefined && fee !== null && parseFloat(fee) >= 0 && parseFloat(fee) <= 10;
      } catch (error) {
        return false;
      }
    }
  }]);
  return MarketValidator;
}(_baseValidator2.default);

module.exports = MarketValidator;