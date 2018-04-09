"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO
// rename OlympiaToken to PlayToken
var isPlayMoneyToken = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(configInstance) {
        var playTokenIstance;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        playTokenIstance = configInstance.gnosisJS.contracts.OlympiaToken.at(configInstance.collateralToken);
                        _context.t0 = playTokenIstance.isPlayToken;

                        if (!_context.t0) {
                            _context.next = 8;
                            break;
                        }

                        _context.next = 6;
                        return playTokenIstance.isPlayToken();

                    case 6:
                        _context.t1 = _context.sent;
                        _context.t0 = _context.t1 == true;

                    case 8:
                        if (!_context.t0) {
                            _context.next = 12;
                            break;
                        }

                        return _context.abrupt("return", true);

                    case 12:
                        return _context.abrupt("return", false);

                    case 13:
                        _context.next = 18;
                        break;

                    case 15:
                        _context.prev = 15;
                        _context.t2 = _context["catch"](0);
                        return _context.abrupt("return", false);

                    case 18:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, undefined, [[0, 15]]);
    }));

    return function isPlayMoneyToken(_x) {
        return _ref.apply(this, arguments);
    };
}();

var getPlayMoneyTokenInstance = function getPlayMoneyTokenInstance(configInstance) {
    return configInstance.gnosisJS.contracts.OlympiaToken.at(configInstance.collateralToken);
};

module.exports = {
    isPlayMoneyToken: isPlayMoneyToken,
    getPlayMoneyTokenInstance: getPlayMoneyTokenInstance
};