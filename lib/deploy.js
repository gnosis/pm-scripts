'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _os = require('./utils/os');

var _log = require('./utils/log');

var _fileWriter = require('./utils/fileWriter');

var _fileWriter2 = _interopRequireDefault(_fileWriter);

var _configValidator = require('./validators/configValidator');

var _configValidator2 = _interopRequireDefault(_configValidator);

var _tokens = require('./tokens');

var _tokens2 = _interopRequireDefault(_tokens);

var _execution = require('./utils/execution');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
* This scripts handles the deployment process of new markets.
+ Provides also the market with funds.
*/
var steps = {
  '-1': [_execution.createOracle, _execution.createEvent, _execution.createMarket, _execution.fundMarket],
  '0': [_execution.createEvent, _execution.createMarket, _execution.fundMarket],
  '1': [_execution.createMarket, _execution.fundMarket],
  '2': [_execution.fundMarket],
  '3': [] // market resolution not handled on this script, see resolve.js


  /**
  *  Input params:
  * -c : configuration file path, default /conf/config.json
  * -m : market description file path, default /conf/market.json
  * -w : wrap amount of tokens into ether token
  */
};var main = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var marketFile, step, configInstance, configValidator, tokenIstance, args, fileWriter, marketFileCopy, abort, x, currentMarket, updatedMarket;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            marketFile = void 0, step = void 0;
            configInstance = void 0, configValidator = void 0, tokenIstance = void 0;
            args = (0, _execution.processArgs)(process.argv);

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
            _context.prev = 6;
            _context.next = 9;
            return configValidator.isValid();

          case 9:
            _context.next = 11;
            return configValidator.normalize();

          case 11:
            configInstance = configValidator.getConfig();
            _context.next = 18;
            break;

          case 14:
            _context.prev = 14;
            _context.t0 = _context['catch'](6);

            (0, _log.logError)(_context.t0);
            process.exit(1);

          case 18:

            (0, _log.logSuccess)('Your market file content:');
            (0, _log.logInfo)((0, _stringify2.default)(marketFile, undefined, 4));
            // Display user tokens balance
            _context.next = 22;
            return (0, _execution.printTokenBalance)(configInstance);

          case 22:
            _context.next = 24;
            return (0, _execution.printAccountBalance)(configInstance);

          case 24:
            // Ask user to confirm the input JSON description or stop the process
            (0, _execution.askConfirmation)('Do you wish to continue?');

            // Get current market step from market file
            marketFileCopy = marketFile.slice();
            abort = false;

            // Start deploy process

            (0, _log.logInfo)('Starting deploy...');

            if (!(args.amountOfTokens && args.amountOfTokens > 0)) {
              _context.next = 41;
              break;
            }

            _context.prev = 29;

            (0, _log.logInfo)('Wrapping ' + args.amountOfTokens / 1e18 + ' tokens...');
            tokenIstance = new _tokens2.default(configInstance);
            _context.next = 34;
            return tokenIstance.wrapTokens(args.amountOfTokens);

          case 34:
            (0, _log.logInfo)('Tokens wrapped successfully');
            _context.next = 41;
            break;

          case 37:
            _context.prev = 37;
            _context.t1 = _context['catch'](29);

            (0, _log.logError)(_context.t1);
            process.exit(1);

          case 41:
            _context.prev = 41;
            _context.t2 = _regenerator2.default.keys(marketFileCopy);

          case 43:
            if ((_context.t3 = _context.t2()).done) {
              _context.next = 53;
              break;
            }

            x = _context.t3.value;
            currentMarket = marketFileCopy[x];

            step = (0, _execution.getMarketStep)(currentMarket);
            _context.next = 49;
            return (0, _execution.runProcessStack)(configInstance, currentMarket, steps, step);

          case 49:
            updatedMarket = _context.sent;

            marketFileCopy[x] = (0, _assign2.default)(currentMarket, updatedMarket);
            _context.next = 43;
            break;

          case 53:
            (0, _log.logInfo)('Deploy done, writing updates to ' + args.marketPath);
            _context.next = 60;
            break;

          case 56:
            _context.prev = 56;
            _context.t4 = _context['catch'](41);

            // Error logged to console by function raising the error
            (0, _log.logWarn)('Writing updates before aborting...');
            abort = true;

          case 60:
            _context.prev = 60;

            fileWriter.setFilePath(args.marketPath);
            fileWriter.setData(marketFileCopy);
            fileWriter.write();
            if (abort) {
              (0, _log.logWarn)('Updates written successfully, aborting');
              process.exit(1);
            } else {
              (0, _log.logSuccess)('Updates written successfully to ' + args.marketPath);
            }
            return _context.finish(60);

          case 66:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[6, 14], [29, 37], [41, 56, 60, 66]]);
  }));

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

module.exports = {
  main: main
};