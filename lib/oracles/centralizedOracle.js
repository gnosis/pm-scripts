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

var CentralizedOracle = function () {
  function CentralizedOracle(eventDescription, configInstance) {
    (0, _classCallCheck3.default)(this, CentralizedOracle);

    this._eventDescription = eventDescription;
    this._configInstance = configInstance;
    this._ipfsHash = null;
    this._oracleAddress = eventDescription.oracleAddress ? eventDescription.oracleAddress : null;
  }

  (0, _createClass3.default)(CentralizedOracle, [{
    key: "create",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var gasPrice, ipfsHash, oracle;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                gasPrice = this._configInstance.gasPrice;
                _context.next = 3;
                return this._configInstance.gnosisJS.publishEventDescription(this._eventDescription);

              case 3:
                ipfsHash = _context.sent;
                _context.next = 6;
                return this._configInstance.gnosisJS.createCentralizedOracle(ipfsHash, { gasPrice: gasPrice });

              case 6:
                oracle = _context.sent;

                this._ipfsHash = ipfsHash;
                this._oracleAddress = oracle.address;

              case 9:
              case "end":
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
    key: "getAddress",
    value: function getAddress() {
      return this._oracleAddress;
    }
  }, {
    key: "getIpfsHash",
    value: function getIpfsHash() {
      return this._ipfsHash;
    }
  }, {
    key: "isResolved",
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var oracle;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._configInstance.gnosisJS.contracts.CentralizedOracle.at(this._oracleAddress);

              case 2:
                oracle = _context2.sent;
                _context2.next = 5;
                return oracle.isOutcomeSet();

              case 5:
                return _context2.abrupt("return", _context2.sent);

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function isResolved() {
        return _ref2.apply(this, arguments);
      }

      return isResolved;
    }()
  }, {
    key: "resolve",
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(outcome) {
        var oracle;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this._configInstance.gnosisJS.contracts.CentralizedOracle.at(this._oracleAddress);

              case 2:
                oracle = _context3.sent;
                _context3.next = 5;
                return oracle.setOutcome(outcome);

              case 5:
                return _context3.abrupt("return", _context3.sent);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function resolve(_x) {
        return _ref3.apply(this, arguments);
      }

      return resolve;
    }()
  }]);
  return CentralizedOracle;
}();

module.exports = CentralizedOracle;