'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _truffleHdwalletProvider = require('truffle-hdwallet-provider');

var _truffleHdwalletProvider2 = _interopRequireDefault(_truffleHdwalletProvider);

var _pmJs = require('@gnosis.pm/pm-js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Client = function () {
  function Client(mnemonic, providerUrl) {
    var numAccounts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    (0, _classCallCheck3.default)(this, Client);

    this._providerUrl = providerUrl;
    this._provider = new _truffleHdwalletProvider2.default(mnemonic, providerUrl, 0, numAccounts);
    this._web3 = new _web2.default(this._provider);
  }

  (0, _createClass3.default)(Client, [{
    key: 'getWeb3',
    value: function getWeb3() {
      return this._web3;
    }
  }, {
    key: 'getProvider',
    value: function getProvider() {
      return this._provider;
    }
  }, {
    key: 'getAccounts',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', (0, _pmJs.promisify)(this._web3.eth.getAccounts)());

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getAccounts() {
        return _ref.apply(this, arguments);
      }

      return getAccounts;
    }()
  }, {
    key: 'getBalance',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(address) {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt('return', (0, _pmJs.promisify)(this._web3.eth.getBalance)(address));

              case 1:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getBalance(_x2) {
        return _ref2.apply(this, arguments);
      }

      return getBalance;
    }()
  }]);
  return Client;
}();

module.exports = Client;