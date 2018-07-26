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

var _tokens = require('../utils/tokens');

var _centralizedOracle = require('./../oracles/centralizedOracle');

var _centralizedOracle2 = _interopRequireDefault(_centralizedOracle);

var _categoricalEvent = require('./../events/categoricalEvent');

var _categoricalEvent2 = _interopRequireDefault(_categoricalEvent);

var _scalarEvent = require('./../events/scalarEvent');

var _scalarEvent2 = _interopRequireDefault(_scalarEvent);

var _pmJs = require('@gnosis.pm/pm-js');

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
        var txReceipt, market, collateralTokenInstance, playTokenInstance, txResponse, web3;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                txReceipt = void 0;
                market = this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress);
                collateralTokenInstance = this._configInstance.gnosisJS.contracts.Token.at(this._configInstance.collateralToken);

                // Check if token is play money token

                _context2.next = 5;
                return (0, _tokens.isPlayMoneyToken)(this._configInstance);

              case 5:
                if (!_context2.sent) {
                  _context2.next = 9;
                  break;
                }

                playTokenInstance = (0, _tokens.getPlayMoneyTokenInstance)(this._configInstance);
                _context2.next = 9;
                return playTokenInstance.allowTransfers([this._marketInfo.marketAddress, this._marketInfo.eventAddress]);

              case 9:
                _context2.next = 11;
                return collateralTokenInstance.approve(this._marketAddress, this._marketInfo.funding);

              case 11:
                _context2.next = 13;
                return market.fund(this._marketInfo.funding);

              case 13:
                txResponse = _context2.sent;

                if (!(txResponse.receipt && parseInt(txResponse.receipt.status) === 0)) {
                  _context2.next = 18;
                  break;
                }

                throw new Error('Funding transaction for market ' + this._marketAddress + ' failed.');

              case 18:
                if (!(txResponse.receipt && parseInt(txResponse.receipt.status) === 1)) {
                  _context2.next = 20;
                  break;
                }

                return _context2.abrupt('return');

              case 20:

                (0, _log.logInfo)('Waiting for funding transaction to be mined, tx hash: ' + txResponse.tx);

                web3 = this._configInstance.blockchainProvider.getWeb3();

              case 22:
                if (!true) {
                  _context2.next = 47;
                  break;
                }

                _sleep2.default.msleep(_constants.TX_LOOKUP_TIME);
                _context2.next = 26;
                return (0, _pmJs.promisify)(web3.eth.getTransactionReceipt)(txResponse.tx);

              case 26:
                txReceipt = _context2.sent;

                if (txReceipt) {
                  _context2.next = 31;
                  break;
                }

                return _context2.abrupt('continue', 22);

              case 31:
                if (!(txReceipt && txReceipt.status === 0)) {
                  _context2.next = 35;
                  break;
                }

                throw new Error('Funding transaction for market ' + this._marketAddress + ' failed.');

              case 35:
                if (!(txReceipt && txReceipt.status === 1)) {
                  _context2.next = 39;
                  break;
                }

                return _context2.abrupt('break', 47);

              case 39:
                if (!(txReceipt && txReceipt.status === '0x0')) {
                  _context2.next = 43;
                  break;
                }

                throw new Error('Funding transaction for market ' + this._marketAddress + ' failed.');

              case 43:
                if (!(txReceipt && txReceipt.status === '0x1')) {
                  _context2.next = 45;
                  break;
                }

                return _context2.abrupt('break', 47);

              case 45:
                _context2.next = 22;
                break;

              case 47:
                (0, _log.logInfo)('Funding transaction was mined');

              case 48:
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
    key: 'resolve',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var oracle, outcomeSet, event, txReceipt, market, stage, web3, oracleTxResponse, eventTxResponse;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                oracle = void 0, outcomeSet = void 0, event = void 0, txReceipt = void 0;
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
                // Resolve market
                // await this._configInstance.gnosisJS.resolveEvent({event: this._marketInfo.event, outcome: this._marketInfo.winningOutcome})
                web3 = this._configInstance.blockchainProvider.getWeb3();
                // Resolve oracle

                oracle = new _centralizedOracle2.default(this._marketInfo, this._configInstance);
                _context3.next = 19;
                return oracle.isResolved();

              case 19:
                if (_context3.sent) {
                  _context3.next = 54;
                  break;
                }

                (0, _log.logInfo)('Setting outcome on the Oracle');
                _context3.next = 23;
                return oracle.resolve(this._marketInfo.winningOutcome);

              case 23:
                oracleTxResponse = _context3.sent;

                (0, _log.logInfo)('Waiting for oracle setOutcome transaction to be mined, tx hash: ' + oracleTxResponse.tx);

              case 25:
                if (!true) {
                  _context3.next = 52;
                  break;
                }

                _sleep2.default.msleep(_constants.TX_LOOKUP_TIME);
                _context3.next = 29;
                return (0, _pmJs.promisify)(web3.eth.getTransactionReceipt)(oracleTxResponse.tx);

              case 29:
                txReceipt = _context3.sent;

                if (txReceipt) {
                  _context3.next = 34;
                  break;
                }

                return _context3.abrupt('continue', 25);

              case 34:
                if (!(txReceipt && txReceipt.status === 0)) {
                  _context3.next = 38;
                  break;
                }

                throw new Error('Set outcome transaction has failed.');

              case 38:
                if (!(txReceipt && txReceipt.status === 1)) {
                  _context3.next = 43;
                  break;
                }

                (0, _log.logInfo)('Oracle setOutcome transaction was mined');
                return _context3.abrupt('break', 52);

              case 43:
                if (!(txReceipt && txReceipt.status === '0x0')) {
                  _context3.next = 47;
                  break;
                }

                throw new Error('Set outcome transaction has failed.');

              case 47:
                if (!(txReceipt && txReceipt.status === '0x1')) {
                  _context3.next = 50;
                  break;
                }

                (0, _log.logInfo)('Oracle setOutcome transaction was mined');
                return _context3.abrupt('break', 52);

              case 50:
                _context3.next = 25;
                break;

              case 52:
                _context3.next = 55;
                break;

              case 54:
                (0, _log.logInfo)('Oracle already resolved');

              case 55:
                // Resolve event
                if (this._marketInfo.outcomeType === 'SCALAR') {
                  event = new _scalarEvent2.default(this._marketInfo, this._configInstance);
                } else {
                  event = new _categoricalEvent2.default(this._marketInfo, this._configInstance);
                }

                _context3.next = 58;
                return event.isResolved();

              case 58:
                if (_context3.sent) {
                  _context3.next = 93;
                  break;
                }

                (0, _log.logInfo)('Setting outcome on the Event');
                _context3.next = 62;
                return event.resolve();

              case 62:
                eventTxResponse = _context3.sent;

                (0, _log.logInfo)('Waiting for event setOutcome transaction to be mined, tx hash: ' + eventTxResponse.tx);

              case 64:
                if (!true) {
                  _context3.next = 91;
                  break;
                }

                _sleep2.default.msleep(_constants.TX_LOOKUP_TIME);
                _context3.next = 68;
                return (0, _pmJs.promisify)(web3.eth.getTransactionReceipt)(eventTxResponse.tx);

              case 68:
                txReceipt = _context3.sent;

                if (txReceipt) {
                  _context3.next = 73;
                  break;
                }

                return _context3.abrupt('continue', 64);

              case 73:
                if (!(txReceipt && txReceipt.status === 0)) {
                  _context3.next = 77;
                  break;
                }

                throw new Error('Set outcome transaction has failed.');

              case 77:
                if (!(txReceipt && txReceipt.status === 1)) {
                  _context3.next = 82;
                  break;
                }

                (0, _log.logInfo)('Event setOutcome transaction was mined');
                return _context3.abrupt('break', 91);

              case 82:
                if (!(txReceipt && txReceipt.status === '0x0')) {
                  _context3.next = 86;
                  break;
                }

                throw new Error('Set outcome transaction has failed.');

              case 86:
                if (!(txReceipt && txReceipt.status === '0x1')) {
                  _context3.next = 89;
                  break;
                }

                (0, _log.logInfo)('Event setOutcome transaction was mined');
                return _context3.abrupt('break', 91);

              case 89:
                _context3.next = 64;
                break;

              case 91:
                _context3.next = 94;
                break;

              case 93:
                (0, _log.logInfo)('Event already resolved');

              case 94:
                _context3.next = 96;
                return market.close();

              case 96:
                // this._configInstance.gnosisJS.contracts.Market.close()
                // Wait for the transaction to take effect
                (0, _log.logInfo)('Waiting for market resolution process to complete...');

              case 97:
                if (!true) {
                  _context3.next = 115;
                  break;
                }

                _context3.next = 100;
                return this._configInstance.gnosisJS.contracts.CentralizedOracle.at(this._marketInfo.oracleAddress);

              case 100:
                oracle = _context3.sent;
                _context3.next = 103;
                return this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress);

              case 103:
                market = _context3.sent;
                _context3.next = 106;
                return market.stage();

              case 106:
                stage = _context3.sent;
                _context3.next = 109;
                return oracle.isOutcomeSet();

              case 109:
                outcomeSet = _context3.sent;

                if (!(stage.toNumber() === _constants.MARKET_STAGES.closed && outcomeSet)) {
                  _context3.next = 112;
                  break;
                }

                return _context3.abrupt('break', 115);

              case 112:
                _sleep2.default.msleep(_constants.TX_LOOKUP_TIME);
                _context3.next = 97;
                break;

              case 115:
                (0, _log.logSuccess)('Market ' + this._marketAddress + ' resolved successfully');

              case 116:

                this._winningOutcome = this._marketInfo.winningOutcome;

              case 117:
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
  }, {
    key: 'isResolved',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var oracle;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this._configInstance.gnosisJS.contracts.CentralizedOracle.at(this._marketInfo.oracleAddress);

              case 2:
                oracle = _context5.sent;
                return _context5.abrupt('return', oracle.isSet());

              case 4:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function isResolved() {
        return _ref5.apply(this, arguments);
      }

      return isResolved;
    }()
  }]);
  return Market;
}();

module.exports = Market;