'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _tokens = require('../utils/tokens');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Token = function () {
  function Token(configInstance) {
    (0, _classCallCheck3.default)(this, Token);

    this._configInstance = configInstance;
  }

  (0, _createClass3.default)(Token, [{
    key: 'wrapTokens',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(amount) {
        var result, playTokenContract, etherTokenContract;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                result = void 0;

                if (!(!amount || amount <= 0)) {
                  _context.next = 3;
                  break;
                }

                throw new Error('Cannot deposit inval amounts of Ether, got ' + amount + ' ETH');

              case 3:
                _context.next = 5;
                return (0, _tokens.isPlayMoneyToken)(this._configInstance);

              case 5:
                _context.t0 = _context.sent;

                if (!(_context.t0 == true)) {
                  _context.next = 13;
                  break;
                }

                playTokenContract = this._configInstance.gnosisJS.contracts.OlympiaToken.at(this._configInstance.collateralToken);
                _context.next = 10;
                return playTokenContract.issue([this._configInstance.account], amount);

              case 10:
                result = _context.sent;
                _context.next = 17;
                break;

              case 13:
                etherTokenContract = this._configInstance.gnosisJS.contracts.EtherToken.at(this._configInstance.collateralToken);
                _context.next = 16;
                return etherTokenContract.deposit({ value: amount });

              case 16:
                result = _context.sent;

              case 17:
                return _context.abrupt('return', result);

              case 18:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function wrapTokens(_x) {
        return _ref.apply(this, arguments);
      }

      return wrapTokens;
    }()
  }]);
  return Token;
}();

module.exports = Token;