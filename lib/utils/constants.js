'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TX_LOOKUP_TIME = 5000; // milliseconds
var HD_WALLET_ACCOUNTS = 10;
var ETH_ADDRESS_LENGTH = 42;
var DEFAULT_CONFIG_FILE_PATH = _path2.default.join(__dirname, '../../conf/config.json');
var DEFAULT_MARKET_FILE_PATH = _path2.default.join(__dirname, '../../conf/markets.json');
var SDK_VERSION = '0.0.1';

var MARKET_STAGES = {
  created: 0,
  funded: 1,
  closed: 2
};

module.exports = {
  TX_LOOKUP_TIME: TX_LOOKUP_TIME,
  ETH_ADDRESS_LENGTH: ETH_ADDRESS_LENGTH,
  DEFAULT_CONFIG_FILE_PATH: DEFAULT_CONFIG_FILE_PATH,
  DEFAULT_MARKET_FILE_PATH: DEFAULT_MARKET_FILE_PATH,
  MARKET_STAGES: MARKET_STAGES,
  HD_WALLET_ACCOUNTS: HD_WALLET_ACCOUNTS,
  SDK_VERSION: SDK_VERSION
};