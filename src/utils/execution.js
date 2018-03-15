/**
* Collection of useful functions for the market creation/resolution process
*/
import { DEFAULT_CONFIG_FILE_PATH, DEFAULT_MARKET_FILE_PATH, SDK_VERSION } from './constants'
import { logSuccess, logInfo, logError, logWarn } from './log'
import { capitalizeFirstLetter } from './string'
import CentralizedOracle from './../oracles/centralizedOracle'
import CategoricalEvent from './../events/categoricalEvent'
import ScalarEvent from './../events/scalarEvent'
import Market from './../markets'
import MarketValidator from './../validators/marketValidator'
import Client from './../clients/ethereum'
import readlineSync from 'readline-sync'
import minimist from 'minimist'

/**
* Prints out the token balance of the account defined in the configuration
*/
const printTokenBalance = async configInstance => {
  const etherToken = await configInstance.gnosisJS.contracts.EtherToken.at(configInstance.collateralToken)
  const balance = (await etherToken.balanceOf(configInstance.account)) / 1e18
  logSuccess(`Your current collateral token balance is ${balance}`)
}

/**
* Prints out the current setted ethereum account and balance
*/
const printAccountBalance = async configInstance => {
  const client = new Client(configInstance.mnemonic, configInstance.blockchainUrl)
  const balance = (await client.getBalance(configInstance.account)) / 1e18
  logSuccess(`Your Ethereum address is ${configInstance.account}`)
  logSuccess(`Your account balance is ${balance} ETH`)
}

/**
* Asks to the user if he wishes or not to continue processing
*/
const askConfirmation = (message, exit = true) => {
  const choose = readlineSync.keyInYN(message)
  if (!choose) {
    if (exit) {
      process.exit(0)
    }
  }
  return choose
}

/**
* Analyzes the market description file and determines on which of
* the defined steps the market management process is.
* (Ej. Oracle creation, Event creation etc..)
*/
const getMarketStep = marketDescription => {
  const steps = ['oracleAddress', 'eventAddress', 'marketAddress', 'winningOutcome']
  let step = -1
  for (let x in steps) {
    if (!(steps[x] in marketDescription)) {
      return step
    } else if (steps[x] in marketDescription && (
      marketDescription[steps[x]] === null ||
      marketDescription[steps[x]] === undefined ||
      (typeof marketDescription[steps[x]] === 'string' &&
        marketDescription[steps[x]].trim()) === '')) {
      return step
    }
    step = x
  }
  return step
}

/**
* Creates an oracle instance, updates the input market description.
*/
const createOracle = async (eventDescription, configInstance) => {
  logInfo('Creating Centralized Oracle...')
  const oracle = new CentralizedOracle(eventDescription, configInstance)
  await oracle.create()
  eventDescription.oracleAddress = oracle.getAddress()
  logInfo(`Centralized Oracle with address ${eventDescription.oracleAddress} created successfully`)
  return eventDescription
}

/**
* Creates an event instance, updates the input market description.
*/
const createEvent = async (eventDescription, configInstance) => {
  let event
  const capitalizedEventType = capitalizeFirstLetter(eventDescription.outcomeType)
  logInfo(`Creating ${capitalizedEventType} Event...`)
  if (eventDescription.outcomeType === 'SCALAR') {
    event = new ScalarEvent(eventDescription, configInstance)
  } else {
    event = new CategoricalEvent(eventDescription, configInstance)
  }
  await event.create()
  eventDescription.eventAddress = event.getAddress()
  logInfo(`${capitalizedEventType} Event with address ${eventDescription.eventAddress} created successfully`)
  return eventDescription
}

/**
* Creates a market instance, updates the input market description.
*/
const createMarket = async (marketDescription, configInstance) => {
  logInfo('Creating market...')
  const market = new Market(marketDescription, configInstance)
  await market.create()
  marketDescription.marketAddress = market.getAddress()
  logInfo(`Market with address ${marketDescription.marketAddress} created successfully`)
  return marketDescription
}

/**
* Funds a market instance.
*/
const fundMarket = async (marketDescription, configInstance) => {
  logInfo(`Funding market with address ${marketDescription.marketAddress}...`)
  const market = new Market(marketDescription, configInstance)
  market.setAddress(marketDescription.marketAddress)
  try {
    await market.fund()
  } catch (error) {
    logError('Are you sure you have enough collateral tokens for funding the market?')
    throw error
  }

  logInfo('Market funded successfully')
  return marketDescription
}

/**
* Resolves a market only if winningOutcome is defined in the markets configuration
* file.
*/
const resolveMarket = async (marketDescription, configInstance) => {
  logInfo(`Resolving Market with address ${marketDescription.marketAddress}...`)
  const market = new Market(marketDescription, configInstance)
  if (!marketDescription.winningOutcome) {
    logWarn(`No winning outcome set for market ${marketDescription.marketAddress}`)
  } else {
    try {
      await market.resolve()
      logInfo(`Market with address ${marketDescription.marketAddress} resolved successfully with outcome ${market.formatWinningOutcome()}`)
    } catch (error) {
      logError(error)
    }
  }
  return marketDescription
}

/**
* Validates input args and sets default values eventually
*/
const processArgs = argv => {
  let configPath = DEFAULT_CONFIG_FILE_PATH
  let marketPath = DEFAULT_MARKET_FILE_PATH
  let amountOfTokens
  // Arguments check
  if (argv.length === 2) {
    logWarn('Running SDK Utils with default parameters')
  } else {
    const args = minimist(argv)
    // Here we have to use argv instead of minimist
    // which doesn't treat -help as an unique string, splits it into several params
    if (argv.indexOf('-help') >= 2 || argv.indexOf('-h') >= 2) {
      consoleHelper()
      process.exit(0)
    }
    if (argv.indexOf('-v') >= 2 || argv.indexOf('-version') >= 2) {
      versionHelper()
      process.exit(0)
    }
    // Configuration file param check
    if (args.f && typeof args.f === 'string') {
      logInfo(`Using configuration file: ${args.f}`)
      configPath = args.f
    } else {
      logWarn(`Invalid -f parameter, using default configuration file ${DEFAULT_CONFIG_FILE_PATH}`)
    }
    // Market file param check
    if (args.m && typeof args.m === 'string') {
      logInfo(`Using market file: ${args.m}`)
      marketPath = args.m
    } else {
      logWarn(`Invalid -m parameter, using default market file ${DEFAULT_MARKET_FILE_PATH}`)
    }
    // Wrap Tokens param check
    if (args.w && typeof args.w === 'number') {
      logInfo(`Asked to wrap ${args.w / 1e18} tokens`)
      amountOfTokens = args.w
    } else if (args.w) {
      logWarn('Invalid -w parameter, skipping tokens wrapping step')
    }
  }

  return {
    configPath,
    marketPath,
    amountOfTokens
  }
}

/**
* Runs the execution process stack.
*/
const runProcessStack = async (configInstance, marketDescription, steps, step) => {
  // Validate market description
  const marketValidator = new MarketValidator(marketDescription)
  try {
    marketValidator.isValid()
  } catch (error) {
    logWarn(error)
    process.exit(1)
  }

  for (let x in steps[step]) {
    //
    try {
      if (steps[step][x].name === 'fundMarket') {
        if (!askConfirmation(`Do you wish to fund the market ${marketDescription.marketAddress}?`, false)) {
          // skip
          continue
        }
      }

      logInfo(`Ready to execute ${steps[step][x].name}`)
      marketDescription = await steps[step][x](marketDescription, configInstance)
    } catch (error) {
      logError(`Got an execption on step ${step}`)
      logError(error.message)
      throw error
    }
  }
  return marketDescription
}

const consoleHelper = () => {
  console.info(`GNOSIS SDK - ${SDK_VERSION}`)
  console.info('Deploy usage: node lib/main.js deploy <commands>')
  console.info('Other usage: npm run deploy -- <commands>')
  console.info('Resolution usage: node lib/main.js resolve <commands>')
  console.info('Other resolution usage: npm run resolve -- <commands>')
  console.info('Commands:')
  console.info('-f\tabsolute path to your configuration file.')
  console.info('-m\tabsolute path to your markets file.')
  console.info('-w\tamount of collateral tokens to wrap')
  console.info('-h or -help\tGnosis SDK helper')
  console.info('-v or -version\tGnosis SDK version')
}

const versionHelper = () => {
  console.info(`GNOSIS SDK - ${SDK_VERSION}`)
}

module.exports = {
  printTokenBalance,
  printAccountBalance,
  askConfirmation,
  getMarketStep,
  createOracle,
  createEvent,
  createMarket,
  fundMarket,
  resolveMarket,
  runProcessStack,
  processArgs,
  consoleHelper,
  versionHelper
}
