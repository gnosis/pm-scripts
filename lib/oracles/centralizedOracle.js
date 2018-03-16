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
    this._oracleAddress = null;
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
  }]);
  return CentralizedOracle;
}();

module.exports = CentralizedOracle;