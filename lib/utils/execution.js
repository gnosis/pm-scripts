'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _constants = require('./constants');

var _log = require('./log');

var _string = require('./string');

var _centralizedOracle = require('./../oracles/centralizedOracle');

var _centralizedOracle2 = _interopRequireDefault(_centralizedOracle);

var _categoricalEvent = require('./../events/categoricalEvent');

var _categoricalEvent2 = _interopRequireDefault(_categoricalEvent);

var _scalarEvent = require('./../events/scalarEvent');

var _scalarEvent2 = _interopRequireDefault(_scalarEvent);

var _markets = require('./../markets');

var _markets2 = _interopRequireDefault(_markets);

var _marketValidator = require('./../validators/marketValidator');

var _marketValidator2 = _interopRequireDefault(_marketValidator);

var _ethereum = require('./../clients/ethereum');

var _ethereum2 = _interopRequireDefault(_ethereum);

var _readlineSync = require('readline-sync');

var _readlineSync2 = _interopRequireDefault(_readlineSync);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
* Prints out the token balance of the account defined in the configuration
*/
var printTokenBalance = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(configInstance) {
    var etherToken, balance;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return configInstance.gnosisJS.contracts.EtherToken.at(configInstance.collateralToken);

          case 2:
            etherToken = _context.sent;
            _context.next = 5;
            return etherToken.balanceOf(configInstance.account);

          case 5:
            _context.t0 = _context.sent;
            balance = _context.t0 / 1e18;

            (0, _log.logSuccess)('Your current collateral token balance is ' + balance + ' WETH');

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function printTokenBalance(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
* Prints out the current setted ethereum account and balance
*/
/**
* Collection of useful functions for the market creation/resolution process
*/
var printAccountBalance = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(configInstance) {
    var client, balance;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            client = new _ethereum2.default(configInstance.mnemonic, configInstance.blockchainUrl);
            _context2.next = 3;
            return client.getBalance(configInstance.account);

          case 3:
            _context2.t0 = _context2.sent;
            balance = _context2.t0 / 1e18;

            (0, _log.logSuccess)('Your Ethereum address is ' + configInstance.account);
            (0, _log.logSuccess)('Your account balance is ' + balance + ' ETH');

          case 7:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function printAccountBalance(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

/**
* Asks to the user if he wishes or not to continue processing
*/
var askConfirmation = function askConfirmation(message) {
  var exit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  var choose = _readlineSync2.default.keyInYN(message);
  if (!choose) {
    if (exit) {
      process.exit(0);
    }
  }
  return choose;
};

/**
* Analyzes the market description file and determines on which of
* the defined steps the market management process is.
* (Ej. Oracle creation, Event creation etc..)
*/
var getMarketStep = function getMarketStep(marketDescription) {
  var steps = ['oracleAddress', 'eventAddress', 'marketAddress', 'winningOutcome'];
  var step = -1;
  for (var x in steps) {
    if (!(steps[x] in marketDescription)) {
      return step;
    } else if (steps[x] in marketDescription && (marketDescription[steps[x]] === null || marketDescription[steps[x]] === undefined || (typeof marketDescription[steps[x]] === 'string' && marketDescription[steps[x]].trim()) === '')) {
      return step;
    }
    step = x;
  }
  return step;
};

/**
* Creates an oracle instance, updates the input market description.
*/
var createOracle = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(eventDescription, configInstance) {
    var oracle;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            (0, _log.logInfo)('Creating Centralized Oracle...');
            oracle = new _centralizedOracle2.default(eventDescription, configInstance);
            _context3.next = 4;
            return oracle.create();

          case 4:
            eventDescription.oracleAddress = oracle.getAddress();
            (0, _log.logInfo)('Centralized Oracle with address ' + eventDescription.oracleAddress + ' created successfully');
            return _context3.abrupt('return', eventDescription);

          case 7:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function createOracle(_x4, _x5) {
    return _ref3.apply(this, arguments);
  };
}();

/**
* Creates an event instance, updates the input market description.
*/
var createEvent = function () {
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(eventDescription, configInstance) {
    var event, capitalizedEventType;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            event = void 0;
            capitalizedEventType = (0, _string.capitalizeFirstLetter)(eventDescription.outcomeType);

            (0, _log.logInfo)('Creating ' + capitalizedEventType + ' Event...');
            if (eventDescription.outcomeType === 'SCALAR') {
              event = new _scalarEvent2.default(eventDescription, configInstance);
            } else {
              event = new _categoricalEvent2.default(eventDescription, configInstance);
            }
            _context4.next = 6;
            return event.create();

          case 6:
            eventDescription.eventAddress = event.getAddress();
            (0, _log.logInfo)(capitalizedEventType + ' Event with address ' + eventDescription.eventAddress + ' created successfully');
            return _context4.abrupt('return', eventDescription);

          case 9:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function createEvent(_x6, _x7) {
    return _ref4.apply(this, arguments);
  };
}();

/**
* Creates a market instance, updates the input market description.
*/
var createMarket = function () {
  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(marketDescription, configInstance) {
    var market;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            (0, _log.logInfo)('Creating market...');
            market = new _markets2.default(marketDescription, configInstance);
            _context5.next = 4;
            return market.create();

          case 4:
            marketDescription.marketAddress = market.getAddress();
            (0, _log.logInfo)('Market with address ' + marketDescription.marketAddress + ' created successfully');
            return _context5.abrupt('return', marketDescription);

          case 7:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  }));

  return function createMarket(_x8, _x9) {
    return _ref5.apply(this, arguments);
  };
}();

/**
* Funds a market instance.
*/
var fundMarket = function () {
  var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(marketDescription, configInstance) {
    var market;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            (0, _log.logInfo)('Funding market with address ' + marketDescription.marketAddress + '...');
            market = new _markets2.default(marketDescription, configInstance);

            market.setAddress(marketDescription.marketAddress);
            _context6.prev = 3;
            _context6.next = 6;
            return market.fund();

          case 6:
            _context6.next = 12;
            break;

          case 8:
            _context6.prev = 8;
            _context6.t0 = _context6['catch'](3);

            (0, _log.logError)('Are you sure you have enough collateral tokens for funding the market?');
            throw _context6.t0;

          case 12:

            (0, _log.logInfo)('Market funded successfully');
            return _context6.abrupt('return', marketDescription);

          case 14:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, undefined, [[3, 8]]);
  }));

  return function fundMarket(_x10, _x11) {
    return _ref6.apply(this, arguments);
  };
}();

/**
* Resolves a market only if winningOutcome is defined in the markets configuration
* file.
*/
var resolveMarket = function () {
  var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(marketDescription, configInstance) {
    var market;
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            (0, _log.logInfo)('Resolving Market with address ' + marketDescription.marketAddress + '...');
            market = new _markets2.default(marketDescription, configInstance);

            if (marketDescription.winningOutcome) {
              _context7.next = 6;
              break;
            }

            (0, _log.logWarn)('No winning outcome set for market ' + marketDescription.marketAddress);
            _context7.next = 15;
            break;

          case 6:
            _context7.prev = 6;
            _context7.next = 9;
            return market.resolve();

          case 9:
            (0, _log.logInfo)('Market with address ' + marketDescription.marketAddress + ' resolved successfully with outcome ' + market.formatWinningOutcome());
            _context7.next = 15;
            break;

          case 12:
            _context7.prev = 12;
            _context7.t0 = _context7['catch'](6);

            (0, _log.logError)(_context7.t0);

          case 15:
            return _context7.abrupt('return', marketDescription);

          case 16:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined, [[6, 12]]);
  }));

  return function resolveMarket(_x12, _x13) {
    return _ref7.apply(this, arguments);
  };
}();

/**
* Validates input args and sets default values eventually
*/
var processArgs = function processArgs(argv) {
  var configPath = _constants.DEFAULT_CONFIG_FILE_PATH;
  var marketPath = _constants.DEFAULT_MARKET_FILE_PATH;
  var amountOfTokens = void 0;
  // Arguments check
  if (argv.length === 2) {
    (0, _log.logWarn)('Running SDK Utils with default parameters');
  } else {
    var args = (0, _minimist2.default)(argv);
    // Here we have to use argv instead of minimist
    // which doesn't treat -help as an unique string, splits it into several params
    if (argv.indexOf('-help') >= 2 || argv.indexOf('-h') >= 2) {
      consoleHelper();
      process.exit(0);
    }
    if (argv.indexOf('-v') >= 2 || argv.indexOf('-version') >= 2) {
      versionHelper();
      process.exit(0);
    }
    // Configuration file param check
    if (args.f && typeof args.f === 'string') {
      (0, _log.logInfo)('Using configuration file: ' + args.f);
      configPath = args.f;
    } else {
      (0, _log.logWarn)('Invalid -f parameter, using default configuration file ' + _constants.DEFAULT_CONFIG_FILE_PATH);
    }
    // Market file param check
    if (args.m && typeof args.m === 'string') {
      (0, _log.logInfo)('Using market file: ' + args.m);
      marketPath = args.m;
    } else {
      (0, _log.logWarn)('Invalid -m parameter, using default market file ' + _constants.DEFAULT_MARKET_FILE_PATH);
    }
    // Wrap Tokens param check
    if (args.w && typeof args.w === 'number') {
      (0, _log.logInfo)('Asked to wrap ' + args.w / 1e18 + ' tokens');
      amountOfTokens = args.w;
    } else if (args.w) {
      (0, _log.logWarn)('Invalid -w parameter, skipping tokens wrapping step');
    }
  }

  return {
    configPath: configPath,
    marketPath: marketPath,
    amountOfTokens: amountOfTokens
  };
};

/**
* Runs the execution process stack.
*/
var runProcessStack = function () {
  var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(configInstance, marketDescription, steps, step) {
    var marketValidator, x;
    return _regenerator2.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            // Validate market description
            marketValidator = new _marketValidator2.default(marketDescription);

            try {
              marketValidator.isValid();
            } catch (error) {
              (0, _log.logWarn)(error);
              process.exit(1);
            }

            _context8.t0 = _regenerator2.default.keys(steps[step]);

          case 3:
            if ((_context8.t1 = _context8.t0()).done) {
              _context8.next = 30;
              break;
            }

            x = _context8.t1.value;
            _context8.prev = 5;

            if (!(steps[step][x].name === 'fundMarket')) {
              _context8.next = 9;
              break;
            }

            if (askConfirmation('Do you wish to fund the market ' + marketDescription.marketAddress + '?', false)) {
              _context8.next = 9;
              break;
            }

            return _context8.abrupt('continue', 3);

          case 9:
            if (!(steps[step][x].name === 'resolveMarket')) {
              _context8.next = 17;
              break;
            }

            if (!marketDescription.winningOutcome) {
              _context8.next = 15;
              break;
            }

            if (askConfirmation('Do you wish to resolve the market ' + marketDescription.marketAddress + ' with outcome ' + marketDescription.winningOutcome + '?', false)) {
              _context8.next = 13;
              break;
            }

            return _context8.abrupt('continue', 3);

          case 13:
            _context8.next = 17;
            break;

          case 15:
            (0, _log.logInfo)('Market ' + marketDescription.marketAddress + ' has no winningOutcome set, skipping it');
            return _context8.abrupt('continue', 3);

          case 17:

            (0, _log.logInfo)('Ready to execute ' + steps[step][x].name);
            _context8.next = 20;
            return steps[step][x](marketDescription, configInstance);

          case 20:
            marketDescription = _context8.sent;
            _context8.next = 28;
            break;

          case 23:
            _context8.prev = 23;
            _context8.t2 = _context8['catch'](5);

            (0, _log.logError)('Got an execption on step ' + step);
            (0, _log.logError)(_context8.t2.message);
            throw _context8.t2;

          case 28:
            _context8.next = 3;
            break;

          case 30:
            return _context8.abrupt('return', marketDescription);

          case 31:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, undefined, [[5, 23]]);
  }));

  return function runProcessStack(_x14, _x15, _x16, _x17) {
    return _ref8.apply(this, arguments);
  };
}();

var consoleHelper = function consoleHelper() {
  console.info('GNOSIS SDK - ' + _constants.SDK_VERSION);
  console.info('Deploy usage: node lib/main.js deploy <commands>');
  console.info('Other usage: npm run deploy -- <commands>');
  console.info('Resolution usage: node lib/main.js resolve <commands>');
  console.info('Other resolution usage: npm run resolve -- <commands>');
  console.info('Commands:');
  console.info('-f\tabsolute path to your configuration file.');
  console.info('-m\tabsolute path to your markets file.');
  console.info('-w\tamount of collateral tokens to wrap');
  console.info('-h or -help\tGnosis SDK helper');
  console.info('-v or -version\tGnosis SDK version');
};

var versionHelper = function versionHelper() {
  console.info('GNOSIS SDK - ' + _constants.SDK_VERSION);
};

module.exports = {
  printTokenBalance: printTokenBalance,
  printAccountBalance: printAccountBalance,
  askConfirmation: askConfirmation,
  getMarketStep: getMarketStep,
  createOracle: createOracle,
  createEvent: createEvent,
  createMarket: createMarket,
  fundMarket: fundMarket,
  resolveMarket: resolveMarket,
  runProcessStack: runProcessStack,
  processArgs: processArgs,
  consoleHelper: consoleHelper,
  versionHelper: versionHelper
};