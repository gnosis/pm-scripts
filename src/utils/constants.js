import path from 'path'


const TX_LOOKUP_TIME = 5000 // milliseconds
const HD_WALLET_ACCOUNTS = 10
const ETH_ADDRESS_LENGTH = 42
const DEFAULT_CONFIG_FILE_PATH = path.join(__dirname, '../../conf/config.json')
const DEFAULT_MARKET_FILE_PATH = path.join(__dirname, '../../conf/markets.json')
const DEFAULT_GAS_PRICE = 4000000000 // 4 GWEI
const DEFAULT_GAS_LIMIT = 7500000
const SDK_VERSION = require('../../package.json').version

const MARKET_STAGES = {
  created: 0,
  funded: 1,
  closed: 2
}

const EXECUTION_TYPES = {
  deploy: 'deploy',
  resolve: 'resolve'
}


module.exports = {
  DEFAULT_CONFIG_FILE_PATH,
  DEFAULT_MARKET_FILE_PATH,
  DEFAULT_GAS_PRICE,
  DEFAULT_GAS_LIMIT,
  ETH_ADDRESS_LENGTH,
  EXECUTION_TYPES,
  HD_WALLET_ACCOUNTS,
  MARKET_STAGES,
  SDK_VERSION,
  TX_LOOKUP_TIME
}
