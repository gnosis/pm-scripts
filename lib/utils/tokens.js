"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isPlayMoneyToken = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(configInstance) {
    var playTokenInstance;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return configInstance.gnosisJS.contracts.PlayToken.at(configInstance.collateralToken);

          case 3:
            playTokenInstance = _context.sent;
            _context.t0 = playTokenInstance.isPlayToken;

            if (!_context.t0) {
              _context.next = 10;
              break;
            }

            _context.next = 8;
            return playTokenInstance.isPlayToken();

          case 8:
            _context.t1 = _context.sent;
            _context.t0 = _context.t1 === true;

          case 10:
            if (!_context.t0) {
              _context.next = 14;
              break;
            }

            return _context.abrupt("return", true);

          case 14:
            return _context.abrupt("return", false);

          case 15:
            _context.next = 20;
            break;

          case 17:
            _context.prev = 17;
            _context.t2 = _context["catch"](0);
            return _context.abrupt("return", false);

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined, [[0, 17]]);
  }));

  return function isPlayMoneyToken(_x) {
    return _ref.apply(this, arguments);
  };
}();

var getPlayMoneyTokenInstance = function getPlayMoneyTokenInstance(configInstance) {
  return configInstance.gnosisJS.contracts.PlayToken.at(configInstance.collateralToken);
};

module.exports = {
  isPlayMoneyToken: isPlayMoneyToken,
  getPlayMoneyTokenInstance: getPlayMoneyTokenInstance
};