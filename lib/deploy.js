'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _execution = require('./utils/execution');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var steps = {
  '-1': [_execution.createOracle, _execution.createEvent, _execution.createMarket, _execution.fundMarket],
  '0': [_execution.createEvent, _execution.createMarket, _execution.fundMarket],
  '1': [_execution.createMarket, _execution.fundMarket],
  '2': [_execution.fundMarket],
  '3': [] // market resolution not handled on this script, see resolve.js


  /**
  * Deploy wrapper entrypoint
  */
}; /**
   * This scripts handles the deployment process of new markets.
   + Provides also the market with funds.
   */

var main = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(args) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _execution.executor)(args, 'deploy', steps);

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function main(_x) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = {
  main: main
};