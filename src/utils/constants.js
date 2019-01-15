import path from 'path'

const TX_LOOKUP_TIME = 5000 // milliseconds
const HD_WALLET_ACCOUNTS = 10
const ETH_ADDRESS_LENGTH = 42
const DEFAULT_CONFIG_FILE_PATH = path.join(__dirname, '../../conf/config.json')
const DEFAULT_MARKET_FILE_PATH = path.join(__dirname, '../../conf/markets.json')
const DEFAULT_GAS_PRICE = 4000000000 // 4 GWEI
const DEFAULT_GAS_LIMIT = 7500000
const SDK_VERSION = '1.3.2'

const MARKET_STAGES = {
  created: 0,
  funded: 1,
  closed: 2
}

module.exports = {
  TX_LOOKUP_TIME,
  ETH_ADDRESS_LENGTH,
  DEFAULT_CONFIG_FILE_PATH,
  DEFAULT_MARKET_FILE_PATH,
  DEFAULT_GAS_PRICE,
  DEFAULT_GAS_LIMIT,
  MARKET_STAGES,
  HD_WALLET_ACCOUNTS,
  SDK_VERSION
}
