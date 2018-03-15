'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _constants = require('../utils/constants');

var _log = require('../utils/log');

var _gnosisjs = require('@gnosis.pm/gnosisjs');

var _sleep = require('sleep');

var _sleep2 = _interopRequireDefault(_sleep);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Market = function () {
  function Market(marketInfo, configInstance) {
    (0, _classCallCheck3.default)(this, Market);

    this._marketInfo = (0, _assign2.default)({}, marketInfo);
    (0, _assign2.default)(this._marketInfo, {
      event: configInstance.gnosisJS.contracts.Event.at(marketInfo.eventAddress),
      marketMaker: configInstance.gnosisJS.lmsrMarketMaker,
      gasPrice: configInstance.gasPrice
    });
    this._configInstance = configInstance;
    this._marketAddress = marketInfo.marketAddress || null;
  }

  (0, _createClass3.default)(Market, [{
    key: 'create',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var market;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return this._configInstance.gnosisJS.createMarket(this._marketInfo);

              case 3:
                market = _context.sent;

                this._marketAddress = market.address;
                _context.next = 11;
                break;

              case 7:
                _context.prev = 7;
                _context.t0 = _context['catch'](0);

                console.log(_context.t0);
                throw _context.t0;

              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 7]]);
      }));

      function create() {
        return _ref.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'fund',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var txReceipt, market, etherToken, txResponse, web3;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                txReceipt = void 0;
                market = this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress);
                etherToken = this._configInstance.gnosisJS.contracts.EtherToken.at(this._configInstance.collateralToken);
                // Approve tokens transferral

                _context2.next = 5;
                return etherToken.approve(this._marketAddress, this._marketInfo.funding);

              case 5:
                _context2.next = 7;
                return market.fund(this._marketInfo.funding);

              case 7:
                txResponse = _context2.sent;

                if (!(txResponse.receipt && txResponse.receipt.status === 0)) {
                  _context2.next = 12;
                  break;
                }

                throw new Error('Funding transaction for market ' + this._marketAddress + ' failed.');

              case 12:
                if (!(txResponse.receipt && txResponse.receipt.status === 1)) {
                  _context2.next = 14;
                  break;
                }

                return _context2.abrupt('return');

              case 14:
                (0, _log.logInfo)('Waiting for funding transaction to be mined, tx hash: ' + txResponse.tx);
                web3 = this._configInstance.blockchainProvider.getWeb3();

              case 16:
                if (!true) {
                  _context2.next = 41;
                  break;
                }

                _sleep2.default.msleep(_constants.TX_LOOKUP_TIME);
                _context2.next = 20;
                return (0, _gnosisjs.promisify)(web3.eth.getTransactionReceipt)(txResponse.tx);

              case 20:
                txReceipt = _context2.sent;

                if (txReceipt) {
                  _context2.next = 25;
                  break;
                }

                return _context2.abrupt('continue', 16);

              case 25:
                if (!(txReceipt && txReceipt.status === 0)) {
                  _context2.next = 29;
                  break;
                }

                throw new Error('Funding transaction for market ' + this._marketAddress + ' failed.');

              case 29:
                if (!(txReceipt && txReceipt.status === 1)) {
                  _context2.next = 33;
                  break;
                }

                return _context2.abrupt('break', 41);

              case 33:
                if (!(txReceipt && txReceipt.status === '0x0')) {
                  _context2.next = 37;
                  break;
                }

                throw new Error('Funding transaction for market ' + this._marketAddress + ' failed.');

              case 37:
                if (!(txReceipt && txReceipt.status === '0x1')) {
                  _context2.next = 39;
                  break;
                }

                return _context2.abrupt('break', 41);

              case 39:
                _context2.next = 16;
                break;

              case 41:
                (0, _log.logInfo)('Funding transaction was mined');

              case 42:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function fund() {
        return _ref2.apply(this, arguments);
      }

      return fund;
    }()
  }, {
    key: 'formatWinningOutcome',
    value: function formatWinningOutcome() {
      return this._marketInfo.outcomes ? this._marketInfo.outcomes[this._marketInfo.winningOutcome] : this._marketInfo.winningOutcome / (10 ^ this._marketInfo.decimals) + ' ' + this._marketInfo.unit;
    }
  }, {
    key: 'resolve',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var oracle, outcomeSet, market, stage;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                oracle = void 0, outcomeSet = void 0;
                _context3.next = 3;
                return this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress);

              case 3:
                market = _context3.sent;
                _context3.next = 6;
                return market.stage();

              case 6:
                stage = _context3.sent;

                if (!(stage.toNumber() === _constants.MARKET_STAGES.created)) {
                  _context3.next = 11;
                  break;
                }

                throw new Error('Market ' + this._marketAddress + ' cannot be resolved. It must be in funded stage (current stage is CREATED)');

              case 11:
                if (!(stage.toNumber() === _constants.MARKET_STAGES.closed)) {
                  _context3.next = 15;
                  break;
                }

                throw new Error('Market ' + this._marketAddress + ' cannot be resolved. It must be in funded stage (current stage is CLOSED)');

              case 15:
                _context3.next = 17;
                return this._configInstance.gnosisJS.resolveEvent({ event: this._marketInfo.event, outcome: this._marketInfo.winningOutcome });

              case 17:
                _context3.next = 19;
                return market.close();

              case 19:
                // this._configInstance.gnosisJS.contracts.Market.close()
                // Wait for the transaction to take effect
                (0, _log.logInfo)('Waiting for market resolution process to complete...');

              case 20:
                if (!true) {
                  _context3.next = 38;
                  break;
                }

                _context3.next = 23;
                return this._configInstance.gnosisJS.contracts.CentralizedOracle.at(this._marketInfo.oracleAddress);

              case 23:
                oracle = _context3.sent;
                _context3.next = 26;
                return this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress);

              case 26:
                market = _context3.sent;
                _context3.next = 29;
                return market.stage();

              case 29:
                stage = _context3.sent;
                _context3.next = 32;
                return oracle.isOutcomeSet();

              case 32:
                outcomeSet = _context3.sent;

                if (!(stage.toNumber() === _constants.MARKET_STAGES.closed && outcomeSet)) {
                  _context3.next = 35;
                  break;
                }

                return _context3.abrupt('break', 38);

              case 35:
                _sleep2.default.msleep(_constants.TX_LOOKUP_TIME);
                _context3.next = 20;
                break;

              case 38:

                this._winningOutcome = this._marketInfo.winningOutcome;

              case 39:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function resolve() {
        return _ref3.apply(this, arguments);
      }

      return resolve;
    }()
  }, {
    key: 'setAddress',
    value: function setAddress(address) {
      this._marketAddress = address;
    }
  }, {
    key: 'getAddress',
    value: function getAddress() {
      return this._marketAddress;
    }
  }, {
    key: 'getData',
    value: function getData() {
      return this._marketInfo;
    }
  }, {
    key: 'getWinningOutcome',
    value: function getWinningOutcome() {
      return this._winningOutcome;
    }
  }, {
    key: 'getStage',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                return _context4.abrupt('return', this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress).stage());

              case 1:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getStage() {
        return _ref4.apply(this, arguments);
      }

      return getStage;
    }()
  }]);
  return Market;
}();

module.exports = Market;