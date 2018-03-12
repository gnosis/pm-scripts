import path from 'path'

const ETH_ADDRESS_LENGTH = 42
const DEFAULT_CONFIG_FILE_PATH = path.join(__dirname, '../../conf/config.json')
const DEFAULT_MARKET_FILE_PATH = path.join(__dirname, '../../conf/markets.json')

module.exports = {
  ETH_ADDRESS_LENGTH,
  DEFAULT_CONFIG_FILE_PATH,
  DEFAULT_MARKET_FILE_PATH
}
