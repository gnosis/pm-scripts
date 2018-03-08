import { readFile } from './utils/os'
import FileWriter from './utils/fileWriter'
import ConfigValidator from './validators/configValidator'
import MarketValidator from './validators/marketValidator'
import CentralizedOracle from './oracles/centralizedOracle'
import CategoricalEvent from './events/categoricalEvent'
import ScalarEvent from './events/scalarEvent'
import Market from './markets'

const createOracle = (eventDescription, configInstance) => {
  const oracle = new CentralizedOracle(eventDescription, configInstance)
  oracle.create()
  return oracle
}

const createEvent = (eventDescription, configInstance) => {
  let event
  if (eventDescription.outcomeType === 'SCALAR') {
    event = new ScalarEvent(eventDescription, configInstance)
  } else {
    event = new CategoricalEvent(eventDescription, configInstance)
  }
  event.create()
  return event
}

const createMarket = (marketDescription, configInstance) => {
  const market = new Market(marketDescription, configInstance)
  market.create()
  return market
}

const fundMarket = () => {
  // TODO
}

const runProcessStack = (configPath, marketReadPath, marketWritePath) => {
  // TODO fund + tests
  let configInstance, oracle, event, market, fund
  // Instantiate file writer
  const fileWriter = new FileWriter(marketWritePath)
  // Read market description file
  const marketDescription = readFile(marketReadPath)
  // Validate user file configuration
  const configValidator = new ConfigValidator(configPath)
  try {
    configValidator.isValid()
    configValidator.normalize()
    configInstance = configValidator.getConfig()
  } catch (error) {
    console.warn(error)
    process.exit(1)
  }

  // Validate market description
  const marketValidator = new MarketValidator(marketDescription)
  try {
    marketValidator.isValid()
  } catch (error) {
    console.warn(error)
    process.exit(1)
  }
  // Create oracle
  oracle = createOracle(marketDescription, configInstance)
  marketDescription.oracleAddress = oracle.getAddress()
  fileWriter.setData({
    'CentralizedOracle': marketDescription.oracleAddress
  })
  // Create event
  event = createEvent(marketDescription, configInstance)
  marketDescription.eventAddress = event.getAddress()
  fileWriter.setData({
    'Event': marketDescription.eventAddress
  })
  // Create market
  market = createMarket(marketDescription, configInstance)
  fileWriter.setData({
    'Market': market.getAddress()
  })
  // Fund market
  fund = fundMarket()
}

const main = () => {
  console.log("### main ###")
  // TODO
  // check input params:
  // -c : configuration file path, default /conf/config.json
  // -m : market description file path, default /conf/market.json
}

main()
