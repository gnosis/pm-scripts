'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

var _baseEvent = require('./baseEvent');

var _baseEvent2 = _interopRequireDefault(_baseEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ScalarEvent = function (_BaseEvent) {
  (0, _inherits3.default)(ScalarEvent, _BaseEvent);

  function ScalarEvent(eventInfo, configInstance) {
    (0, _classCallCheck3.default)(this, ScalarEvent);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ScalarEvent.__proto__ || (0, _getPrototypeOf2.default)(ScalarEvent)).call(this));

    _this._eventInfo = (0, _assign2.default)({}, eventInfo);
    _this._eventAddress = _this._eventInfo.eventAddress;
    (0, _assign2.default)(_this._eventInfo, {
      collateralToken: configInstance.collateralToken,
      gasPrice: configInstance.gasPrice,
      oracle: configInstance.gnosisJS.contracts.CentralizedOracle.at(eventInfo.oracleAddress)
    });
    _this._configInstance = configInstance;
    return _this;
  }

  (0, _createClass3.default)(ScalarEvent, [{
    key: 'create',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var event;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this._configInstance.gnosisJS.createScalarEvent(this._eventInfo);

              case 2:
                event = _context.sent;

                this._eventAddress = event.address;

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function create() {
        return _ref.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'getAddress',
    value: function getAddress() {
      return this._eventAddress;
    }
  }]);
  return ScalarEvent;
}(_baseEvent2.default);

module.exports = ScalarEvent;