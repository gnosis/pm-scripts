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

var BaseEvent = function () {
  function BaseEvent() {
    (0, _classCallCheck3.default)(this, BaseEvent);
  }

  (0, _createClass3.default)(BaseEvent, [{
    key: "isResolved",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var event;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this._configInstance.gnosisJS.contracts.Event.at(this._eventAddress);

              case 2:
                event = _context.sent;
                _context.next = 5;
                return event.isOutcomeSet();

              case 5:
                return _context.abrupt("return", _context.sent);

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function isResolved() {
        return _ref.apply(this, arguments);
      }

      return isResolved;
    }()
  }, {
    key: "resolve",
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var event;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._configInstance.gnosisJS.contracts.Event.at(this._eventAddress);

              case 2:
                event = _context2.sent;
                _context2.next = 5;
                return event.setOutcome();

              case 5:
                return _context2.abrupt("return", _context2.sent);

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function resolve() {
        return _ref2.apply(this, arguments);
      }

      return resolve;
    }()
  }]);
  return BaseEvent;
}();

module.exports = BaseEvent;