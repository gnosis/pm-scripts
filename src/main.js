import { readFile, fileExists } from './utils/os'
import { DEFAULT_CONFIG_FILE_PATH, DEFAULT_MARKET_FILE_PATH } from './utils/constants'
import { logSuccess, logWarn, logError } from './utils/log'
import FileWriter from './utils/fileWriter'
import ConfigValidator from './validators/configValidator'
import MarketValidator from './validators/marketValidator'
import CentralizedOracle from './oracles/centralizedOracle'
import CategoricalEvent from './events/categoricalEvent'
import ScalarEvent from './events/scalarEvent'
import Market from './markets'
import Token from './tokens'
import minimist from 'minimist'

const printBalance = async configInstance => {
  const etherToken = await configInstance.gnosisJS.contracts.EtherToken.at(configInstance.collateralToken)
  const balance = await etherToken.balanceOf(configInstance.account)
  logSuccess(`Your collateral token balance is ${balance}`)
}

const getMarketStep = marketDescription => {
  const steps = ['oracleAddress', 'eventAddress', 'marketAddress']
  let step = -1
  for (let x in steps) {
    if (!(steps[x] in marketDescription)) {
      return step
    } else if (steps[x] in marketDescription && (
      marketDescription[steps[x]] === null ||
      marketDescription[steps[x]] === undefined ||
      marketDescription[steps[x]].trim() === '')) {
      return step
    }
    step = x
  }
  return step
}

const createOracle = async (eventDescription, configInstance) => {
  const oracle = new CentralizedOracle(eventDescription, configInstance)
  await oracle.create()
  eventDescription.oracleAddress = oracle.getAddress()
  return eventDescription
}

const createEvent = async (eventDescription, configInstance) => {
  let event
  if (eventDescription.outcomeType === 'SCALAR') {
    event = new ScalarEvent(eventDescription, configInstance)
  } else {
    event = new CategoricalEvent(eventDescription, configInstance)
  }
  await event.create()
  eventDescription.eventAddress = event.getAddress()
  return eventDescription
}

const createMarket = async (marketDescription, configInstance) => {
  const market = new Market(marketDescription, configInstance)
  await market.create()
  marketDescription.marketAddress = market.getAddress()
  return marketDescription
}

const fundMarket = async (marketDescription, configInstance) => {
  const market = new Market(marketDescription, configInstance)
  market.setAddress(marketDescription.marketAddress)
  await market.fund()
  return marketDescription
}

const runProcessStack = async (configInstance, marketDescription, step) => {
  // Validate market description
  const marketValidator = new MarketValidator(marketDescription)
  try {
    marketValidator.isValid()
  } catch (error) {
    console.warn(error)
    process.exit(1)
  }

  const steps = {
    '-1': [createOracle, createEvent, createMarket],
    '0': [createEvent, createMarket],
    '1': [createMarket],
    '2': []
  }

  // TODO verify has enough funds

  for (let x in steps[step]) {
    //
    try {
      marketDescription = await steps[step][x](marketDescription, configInstance)
    } catch (error) {
      console.error(`Got an execption on step ${step}`)
      console.error(error.message)
      throw error
    }
  }

  // Fund market
  console.info(`Funding market ${marketDescription.marketAddress}...`)
  marketDescription = await fundMarket(marketDescription, configInstance)
  console.info('Market funded successfully')

  return marketDescription
}

/**
*  Input params:
* -c : configuration file path, default /conf/config.json
* -m : market description file path, default /conf/market.json
* -w : wrap amount of tokens into ether token
*/
const main = async () => {
  let configPath, marketPath, marketFile, step, amountOfTokens
  let configInstance, configValidator, tokenIstance
  configPath = DEFAULT_CONFIG_FILE_PATH
  marketPath = DEFAULT_MARKET_FILE_PATH

  // Instantiate file writer
  const fileWriter = new FileWriter(marketPath, [], false)

  // Arguments check
  if (process.argv.length === 2) {
    logWarn('Running SDK Utils with default parameters')
  } else {
    const args = minimist(process.argv)
    // Configuration file param check
    if (args.f && typeof args.f === 'string') {
      console.info('Using configuration file: ', args.f)
      configPath = args.f
    } else {
      logWarn(`Invalid -f parameter, using default configuration file ${DEFAULT_CONFIG_FILE_PATH}`)
    }
    // Market file param check
    if (args.m && typeof args.m === 'string') {
      console.info('Using market file: ', args.m)
      marketPath = args.m
    } else {
      logWarn(`Invalid -m parameter, using default market file ${DEFAULT_MARKET_FILE_PATH}`)
    }
    // Wrap Tokens param check
    if (args.w && typeof args.w === 'number') {
      console.info(`Asked to wrap ${args.w} tokens`)
      amountOfTokens = args.w
    } else if (args.w) {
      logWarn('Invalid -w parameter, skipping tokens wrapping step')
    }
  }

  // If the provided (or default) market file doesn't exist,
  // raise an error and abort
  if (fileExists(marketPath)) {
    // read market file JSON content
    marketFile = readFile(marketPath)
  } else {
    logWarn(`Market file doesn't exist on path: ${marketPath}`)
    process.exit(1)
  }

  // Validate user file configuration
  configValidator = new ConfigValidator(configPath)
  try {
    await configValidator.isValid()
    await configValidator.normalize()
    configInstance = configValidator.getConfig()
  } catch (error) {
    logError(error)
    process.exit(1)
  }

  // Display user tokens balance
  await printBalance(configInstance)

  // Get current market step from market file
  let marketFileCopy = marketFile.slice()
  let abort = false

  console.info('Starting deploy...')

  if (amountOfTokens && amountOfTokens > 0) {
    // wrap tokens
    try {
      console.info(`Wrapping ${amountOfTokens} tokens...`)
      tokenIstance = new Token(configInstance)
      await tokenIstance.wrapTokens(amountOfTokens)
      console.info('Tokens wrapped successfully')
    } catch (error) {
      logError(error)
      process.exit(1)
    }
  }

  try {
    for (let x in marketFileCopy) {
      let currentMarket = marketFileCopy[x]
      step = getMarketStep(currentMarket)
      console.log('## Step: ', step)
      let updatedMarket = await runProcessStack(configInstance, currentMarket, step)
      marketFileCopy[x] = Object.assign(currentMarket, updatedMarket)
    }
    console.info(`Deploy done, writing updates to ${marketPath}`)
  } catch (error) {
    // Error logged to console by function raising the error
    logWarn('Writing updates before aborting...')
    abort = true
  } finally {
    fileWriter.setFilePath(marketPath)
    fileWriter.setData(marketFileCopy)
    fileWriter.write()
    if (abort) {
      logWarn('Updates written successfully, aborting')
      process.exit(1)
    } else {
      logSuccess('Updates written successfully')
    }
  }
}

/**
* Entry point
*/
main()
