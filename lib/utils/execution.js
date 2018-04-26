'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _constants = require('./constants');

var _log = require('./log');

var _os = require('./os');

var _string = require('./string');

var _centralizedOracle = require('./../oracles/centralizedOracle');

var _centralizedOracle2 = _interopRequireDefault(_centralizedOracle);

var _categoricalEvent = require('./../events/categoricalEvent');

var _categoricalEvent2 = _interopRequireDefault(_categoricalEvent);

var _scalarEvent = require('./../events/scalarEvent');

var _scalarEvent2 = _interopRequireDefault(_scalarEvent);

var _tokens = require('./../tokens');

var _tokens2 = _interopRequireDefault(_tokens);

var _markets = require('./../markets');

var _markets2 = _interopRequireDefault(_markets);

var _marketValidator = require('./../validators/marketValidator');

var _marketValidator2 = _interopRequireDefault(_marketValidator);

var _configValidator = require('./../validators/configValidator');

var _configValidator2 = _interopRequireDefault(_configValidator);

var _fileWriter = require('./fileWriter');

var _fileWriter2 = _interopRequireDefault(_fileWriter);

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
    var etherToken, tokenInfo, balance, tokenName, tokenSymbol, message;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return configInstance.gnosisJS.contracts.Token.at(configInstance.collateralToken);

          case 2:
            etherToken = _context.sent;
            _context.next = 5;
            return new _tokens2.default(configInstance).getInfo();

          case 5:
            tokenInfo = _context.sent;
            _context.next = 8;
            return etherToken.balanceOf(configInstance.account);

          case 8:
            _context.t0 = _context.sent;
            balance = _context.t0 / 1e18;
            tokenName = tokenInfo.name !== undefined ? tokenInfo.name : 'Wrapped Ether Token';
            tokenSymbol = tokenInfo.symbol !== undefined ? tokenInfo.symbol : 'WETH';
            message = 'Your current collateral token balance is ' + balance + ' ' + tokenSymbol + ' (' + tokenName + ')';


            if (configInstance.wrapTokens && configInstance.wrapTokens === true) {
              message += ', will wrap ' + configInstance.amountOfTokens / 1e18 + ' tokens more';
            }
            (0, _log.logSuccess)(message);

          case 15:
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
var getMarketStep = function getMarketStep(marketDescription, executionType) {
  var steps = ['oracleAddress', 'eventAddress', 'marketAddress'];

  if (executionType == 'resolve') {
    steps.push('winningOutcome');
  }

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
            eventDescription.ipfsHash = oracle.getIpfsHash();
            (0, _log.logInfo)('Event Description saved to IPFS, check it out: ' + configInstance.ipfsUrl + '/api/v0/cat?stream-channels=true&arg=' + eventDescription.ipfsHash);
            (0, _log.logInfo)('Centralized Oracle with address ' + eventDescription.oracleAddress + ' created successfully');
            return _context3.abrupt('return', eventDescription);

          case 9:
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
            (0, _log.logInfo)('Market with address ' + marketDescription.marketAddress + ' created successfully, check it out: ' + configInstance.gnosisDBUrl + '/api/markets/' + marketDescription.marketAddress);
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
* Returns a formatted string representing the winning outcome
* accordingly the market type and the decimals in case of Scalar markets.
*/
var formatWinningOutcome = function formatWinningOutcome(marketInfo) {
  return marketInfo.outcomes ? marketInfo.outcomes[marketInfo.winningOutcome] : marketInfo.winningOutcome / Math.pow(10, marketInfo.decimals) + ' ' + marketInfo.unit;
};

/**
* Resolves a market only if winningOutcome is defined in the markets configuration
* file.
*/
var resolveMarket = function () {
  var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(marketDescription, configInstance) {
    var oracleInstance, marketInstance, stage, outcomeSet, market;
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (!(marketDescription.winningOutcome === undefined)) {
              _context7.next = 4;
              break;
            }

            (0, _log.logWarn)('No winning outcome set for market ' + marketDescription.marketAddress);
            _context7.next = 31;
            break;

          case 4:
            _context7.next = 6;
            return configInstance.gnosisJS.contracts.CentralizedOracle.at(marketDescription.oracleAddress);

          case 6:
            oracleInstance = _context7.sent;
            _context7.next = 9;
            return configInstance.gnosisJS.contracts.Market.at(marketDescription.marketAddress);

          case 9:
            marketInstance = _context7.sent;
            _context7.next = 12;
            return marketInstance.stage();

          case 12:
            stage = _context7.sent;
            _context7.next = 15;
            return oracleInstance.isOutcomeSet();

          case 15:
            outcomeSet = _context7.sent;

            if (!(stage.toNumber() === _constants.MARKET_STAGES.closed && outcomeSet)) {
              _context7.next = 20;
              break;
            }

            (0, _log.logInfo)('Market already resolved, skipping it');
            _context7.next = 31;
            break;

          case 20:
            // Start resolving
            (0, _log.logInfo)('Resolving Market with address ' + marketDescription.marketAddress + '...');
            market = new _markets2.default(marketDescription, configInstance);
            _context7.prev = 22;
            _context7.next = 25;
            return market.resolve();

          case 25:
            (0, _log.logInfo)('Market with address ' + marketDescription.marketAddress + ' resolved successfully with outcome ' + formatWinningOutcome(marketDescription));
            _context7.next = 31;
            break;

          case 28:
            _context7.prev = 28;
            _context7.t0 = _context7['catch'](22);

            (0, _log.logError)(_context7.t0);

          case 31:
            return _context7.abrupt('return', marketDescription);

          case 32:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined, [[22, 28]]);
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
    var marketValidator, x, market, stage, formattedOutcome;
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
              _context8.next = 37;
              break;
            }

            x = _context8.t1.value;
            _context8.prev = 5;

            if (!(steps[step][x].name === 'fundMarket')) {
              _context8.next = 15;
              break;
            }

            // Check if the market was already funded
            market = new _markets2.default(marketDescription, configInstance);
            _context8.next = 10;
            return market.getStage();

          case 10:
            stage = _context8.sent;

            if (!(stage.toNumber() === _constants.MARKET_STAGES.funded)) {
              _context8.next = 13;
              break;
            }

            return _context8.abrupt('continue', 3);

          case 13:
            if (askConfirmation('Do you wish to fund the market ' + marketDescription.marketAddress + '?', false)) {
              _context8.next = 15;
              break;
            }

            return _context8.abrupt('continue', 3);

          case 15:
            if (!(steps[step][x].name === 'resolveMarket')) {
              _context8.next = 24;
              break;
            }

            if (!(marketDescription.winningOutcome !== undefined)) {
              _context8.next = 22;
              break;
            }

            formattedOutcome = formatWinningOutcome(marketDescription);

            if (askConfirmation('Do you wish to resolve the market ' + marketDescription.marketAddress + ' with outcome ' + formattedOutcome + '?', false)) {
              _context8.next = 20;
              break;
            }

            return _context8.abrupt('continue', 3);

          case 20:
            _context8.next = 24;
            break;

          case 22:
            (0, _log.logInfo)('Market ' + marketDescription.marketAddress + ' has no winningOutcome set, skipping it');
            return _context8.abrupt('continue', 3);

          case 24:

            (0, _log.logInfo)('Ready to execute ' + steps[step][x].name);
            _context8.next = 27;
            return steps[step][x](marketDescription, configInstance);

          case 27:
            marketDescription = _context8.sent;
            _context8.next = 35;
            break;

          case 30:
            _context8.prev = 30;
            _context8.t2 = _context8['catch'](5);

            if (step === -1) {
              (0, _log.logError)('Got an execption');
            } else {
              (0, _log.logError)('Got an execption on step ' + step);
            }
            (0, _log.logError)(_context8.t2.message);
            throw _context8.t2;

          case 35:
            _context8.next = 3;
            break;

          case 37:
            return _context8.abrupt('return', marketDescription);

          case 38:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, undefined, [[5, 30]]);
  }));

  return function runProcessStack(_x14, _x15, _x16, _x17) {
    return _ref8.apply(this, arguments);
  };
}();

/**
* Main project executor:
* Executor -> runProcessStack
* -c : configuration file path, default /conf/config.json
* -m : market description file path, default /conf/market.json
* -w : wrap amount of tokens into ether token
*/
var executor = function () {
  var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(args, executionType, steps) {
    var marketFile, step, configInstance, configValidator, tokenInstance, fileWriter, marketFileCopy, abort, x, currentMarket, updatedMarket;
    return _regenerator2.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            marketFile = void 0, step = void 0;
            configInstance = void 0, configValidator = void 0, tokenInstance = void 0;

            args = processArgs(args);
            // If the provided (or default) market file doesn't exist,
            // raise an error and abort
            if ((0, _os.fileExists)(args.marketPath)) {
              // read market file JSON content
              try {
                marketFile = (0, _os.readFile)(args.marketPath);
              } catch (error) {
                // File format not JSON compatible
                (0, _log.logError)('File ' + args.marketPath + ' is not JSON compliant, please modify it.');
                process.exit(1);
              }
            } else {
              (0, _log.logWarn)('Market file doesn\'t exist on path: ' + args.marketPath);
              process.exit(1);
            }

            // Instantiate file writer
            fileWriter = new _fileWriter2.default(args.marketPath, [], false);

            // Validate user file configuration

            configValidator = new _configValidator2.default(args.configPath);
            _context9.prev = 6;
            _context9.next = 9;
            return configValidator.isValid();

          case 9:
            _context9.next = 11;
            return configValidator.normalize();

          case 11:
            configInstance = configValidator.getConfig();
            _context9.next = 18;
            break;

          case 14:
            _context9.prev = 14;
            _context9.t0 = _context9['catch'](6);

            (0, _log.logError)(_context9.t0);
            process.exit(1);

          case 18:

            if (args.amountOfTokens && args.amountOfTokens > 0) {
              configInstance.wrapTokens = true;
              configInstance.amountOfTokens = args.amountOfTokens;
            }

            (0, _log.logSuccess)('Your market file content:');
            (0, _log.logInfo)((0, _stringify2.default)(marketFile, undefined, 4));
            // Display user tokens balance
            _context9.next = 23;
            return printTokenBalance(configInstance);

          case 23:
            _context9.next = 25;
            return printAccountBalance(configInstance);

          case 25:
            // Ask user to confirm the input JSON description or stop the process
            askConfirmation('Do you wish to continue?');

            // Get current market step from market file
            marketFileCopy = marketFile.slice();
            abort = false;

            // Start deploy process

            (0, _log.logInfo)('Starting ' + executionType + ', it could take up to 1 minute...');

            if (!configInstance.wrapTokens) {
              _context9.next = 45;
              break;
            }

            _context9.prev = 30;

            (0, _log.logInfo)('Wrapping ' + configInstance.amountOfTokens / 1e18 + ' tokens...');
            tokenInstance = new _tokens2.default(configInstance);
            _context9.next = 35;
            return tokenInstance.wrapTokens(configInstance.amountOfTokens);

          case 35:
            configInstance.wrapTokens = false;
            (0, _log.logInfo)('Tokens wrapped successfully');
            // print updated balance
            _context9.next = 39;
            return printTokenBalance(configInstance);

          case 39:
            _context9.next = 45;
            break;

          case 41:
            _context9.prev = 41;
            _context9.t1 = _context9['catch'](30);

            (0, _log.logError)(_context9.t1);
            process.exit(1);

          case 45:
            _context9.prev = 45;
            _context9.t2 = _regenerator2.default.keys(marketFileCopy);

          case 47:
            if ((_context9.t3 = _context9.t2()).done) {
              _context9.next = 57;
              break;
            }

            x = _context9.t3.value;
            currentMarket = marketFileCopy[x];

            step = getMarketStep(currentMarket, executionType);
            _context9.next = 53;
            return runProcessStack(configInstance, currentMarket, steps, step);

          case 53:
            updatedMarket = _context9.sent;

            marketFileCopy[x] = (0, _assign2.default)(currentMarket, updatedMarket);
            _context9.next = 47;
            break;

          case 57:
            (0, _log.logInfo)(executionType + ' done, writing updates to ' + args.marketPath);
            _context9.next = 64;
            break;

          case 60:
            _context9.prev = 60;
            _context9.t4 = _context9['catch'](45);

            // Error logged to console by function raising the error
            (0, _log.logWarn)('Writing updates before aborting...');
            abort = true;

          case 64:
            _context9.prev = 64;

            fileWriter.setFilePath(args.marketPath);
            fileWriter.setData(marketFileCopy);
            fileWriter.write();
            if (abort) {
              (0, _log.logWarn)('Updates written successfully, aborting');
              process.exit(1);
            } else {
              (0, _log.logSuccess)('Updates written successfully to ' + args.marketPath);
            }
            return _context9.finish(64);

          case 70:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, undefined, [[6, 14], [30, 41], [45, 60, 64, 70]]);
  }));

  return function executor(_x18, _x19, _x20) {
    return _ref9.apply(this, arguments);
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
  formatWinningOutcome: formatWinningOutcome,
  resolveMarket: resolveMarket,
  runProcessStack: runProcessStack,
  processArgs: processArgs,
  consoleHelper: consoleHelper,
  versionHelper: versionHelper,
  executor: executor
};