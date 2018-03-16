"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Token = function () {
  function Token(configInstance) {
    (0, _classCallCheck3.default)(this, Token);

    this._configInstance = configInstance;
  }

  (0, _createClass3.default)(Token, [{
    key: "wrapTokens",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(amount) {
        var etherTokenContract, result;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(!amount || amount <= 0)) {
                  _context.next = 2;
                  break;
                }

                throw new Error("Cannot deposit inval amounts of Ether, got " + amount + " ETH");

              case 2:
                etherTokenContract = this._configInstance.gnosisJS.contracts.EtherToken.at(this._configInstance.collateralToken);
                _context.next = 5;
                return etherTokenContract.deposit({ value: amount });

              case 5:
                result = _context.sent;
                return _context.abrupt("return", result);

              case 7:
              case "end":
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