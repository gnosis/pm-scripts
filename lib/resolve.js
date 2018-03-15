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

var _execution = require('./utils/execution');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var steps = {
  '-1': [_execution.createOracle, _execution.createEvent, _execution.createMarket, _execution.fundMarket, _execution.resolveMarket],
  '0': [_execution.createEvent, _execution.createMarket, _execution.fundMarket, _execution.resolveMarket],
  '1': [_execution.createMarket, _execution.fundMarket, _execution.resolveMarket],
  '2': [_execution.resolveMarket],
  '3': [_execution.resolveMarket]

  /**
  *  Input params:
  * -c : configuration file path, default /conf/config.json
  * -m : market description file path, default /conf/market.json
  * -w : wrap amount of tokens into ether token
  */
}; /**
   * This scripts handles the resolution process of markets.
   + Once a markets gets resolved cannot accept bets anymore.
   */
var main = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var marketFile, step, configInstance, configValidator, args, fileWriter, marketFileCopy, abort, x, currentMarket, updatedMarket;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            marketFile = void 0, step = void 0;
            configInstance = void 0, configValidator = void 0;
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
            // Ask user to confirm or stop the process
            (0, _execution.askConfirmation)('Do you wish to continue?');

            // Get current market step from market file
            marketFileCopy = marketFile.slice();
            abort = false;


            (0, _log.logInfo)('Starting markets resolution...');
            _context.prev = 26;
            _context.t1 = _regenerator2.default.keys(marketFileCopy);

          case 28:
            if ((_context.t2 = _context.t1()).done) {
              _context.next = 38;
              break;
            }

            x = _context.t2.value;
            currentMarket = marketFileCopy[x];

            step = (0, _execution.getMarketStep)(currentMarket);
            _context.next = 34;
            return (0, _execution.runProcessStack)(configInstance, currentMarket, steps, step);

          case 34:
            updatedMarket = _context.sent;

            marketFileCopy[x] = (0, _assign2.default)(currentMarket, updatedMarket);
            _context.next = 28;
            break;

          case 38:
            (0, _log.logInfo)('Resolution done, writing updates to ' + args.marketPath);
            _context.next = 45;
            break;

          case 41:
            _context.prev = 41;
            _context.t3 = _context['catch'](26);

            // Error logged to console by function raising the error
            (0, _log.logWarn)('Writing updates before aborting...');
            abort = true;

          case 45:
            _context.prev = 45;

            fileWriter.setFilePath(args.marketPath);
            fileWriter.setData(marketFileCopy);
            fileWriter.write();
            if (abort) {
              (0, _log.logWarn)('Updates written successfully, aborting');
              process.exit(1);
            } else {
              (0, _log.logSuccess)('Updates written successfully to ' + args.marketPath);
            }
            return _context.finish(45);

          case 51:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[6, 14], [26, 41, 45, 51]]);
  }));

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

module.exports = {
  main: main
};