/**
* Collection of useful functions for the market creation/resolution process
*/
import {
  DEFAULT_CONFIG_FILE_PATH, DEFAULT_MARKET_FILE_PATH, SDK_VERSION,
  MARKET_STAGES
} from './constants'
import { logSuccess, logInfo, logError, logWarn } from './log'
import { readFile, fileExists } from './os'
import { capitalizeFirstLetter } from './string'
import CentralizedOracle from './../oracles/centralizedOracle'
import CategoricalEvent from './../events/categoricalEvent'
import ScalarEvent from './../events/scalarEvent'
import Token from './../tokens'
import Market from './../markets'
import MarketValidator from './../validators/marketValidator'
import ConfigValidator from './../validators/configValidator'
import FileWriter from './fileWriter'
import Client from './../clients/ethereum'
import readlineSync from 'readline-sync'
import minimist from 'minimist'

/**
* Prints out the token balance of the account defined in the configuration
*/
const printTokenBalance = async configInstance => {
  const etherToken = await configInstance.gnosisJS.contracts.Token.at(configInstance.collateralToken)
  const balance = (await etherToken.balanceOf(configInstance.account)) / 1e18
  let message = `Your current collateral token balance is ${balance} WETH`
  if (configInstance.wrapTokens && configInstance.wrapTokens === true) {
    message += `, will wrap ${configInstance.amountOfTokens / 1e18} tokens more`
  }
  logSuccess(message)
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
  eventDescription.ipfsHash = oracle.getIpfsHash()
  logInfo(`Event Description saved to IPFS, check it out: ${configInstance.ipfsUrl}/api/v0/cat?stream-channels=true&arg=${eventDescription.ipfsHash}`)
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
  logInfo(`Market with address ${marketDescription.marketAddress} created successfully, check it out: ${configInstance.gnosisDBUrl}/api/markets/${marketDescription.marketAddress}`)
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
* Returns a formatted string representing the winning outcome
* accordingly the market type and the decimals in case of Scalar markets.
*/
const formatWinningOutcome = marketInfo => {
  return marketInfo.outcomes ? marketInfo.outcomes[marketInfo.winningOutcome] : `${marketInfo.winningOutcome / (10 ** marketInfo.decimals)} ${marketInfo.unit}`
}

/**
* Resolves a market only if winningOutcome is defined in the markets configuration
* file.
*/
const resolveMarket = async (marketDescription, configInstance) => {
  if (!marketDescription.winningOutcome) {
    logWarn(`No winning outcome set for market ${marketDescription.marketAddress}`)
  } else {
    // Check whether market was already resolved or not
    const oracleInstance = await configInstance.gnosisJS.contracts.CentralizedOracle.at(marketDescription.oracleAddress)
    const marketInstance = await configInstance.gnosisJS.contracts.Market.at(marketDescription.marketAddress)
    const stage = await marketInstance.stage()
    const outcomeSet = await oracleInstance.isOutcomeSet()
    if (stage.toNumber() === MARKET_STAGES.closed && outcomeSet) {
      logInfo('Market already resolved, skipping it')
    } else {
      // Start resolving
      logInfo(`Resolving Market with address ${marketDescription.marketAddress}...`)
      const market = new Market(marketDescription, configInstance)
      try {
        await market.resolve()
        logInfo(`Market with address ${marketDescription.marketAddress} resolved successfully with outcome ${formatWinningOutcome(marketDescription)}`)
      } catch (error) {
        logError(error)
      }
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

      if (steps[step][x].name === 'resolveMarket') {
        if (marketDescription.winningOutcome) {
          const formattedOutcome = formatWinningOutcome(marketDescription)
          if (!askConfirmation(`Do you wish to resolve the market ${marketDescription.marketAddress} with outcome ${formattedOutcome}?`, false)) {
            // skip
            continue
          }
        } else {
          logInfo(`Market ${marketDescription.marketAddress} has no winningOutcome set, skipping it`)
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

/**
* Main project executor:
* Executor -> runProcessStack
* -c : configuration file path, default /conf/config.json
* -m : market description file path, default /conf/market.json
* -w : wrap amount of tokens into ether token
*/
const executor = async (args, executionType, steps) => {
  let marketFile, step
  let configInstance, configValidator, tokenIstance
  args = processArgs(args)
  // If the provided (or default) market file doesn't exist,
  // raise an error and abort
  if (fileExists(args.marketPath)) {
    // read market file JSON content
    try {
      marketFile = readFile(args.marketPath)
    } catch (error) {
      // File format not JSON compatible
      logError(`File ${args.marketPath} is not JSON compliant, please modify it.`)
      process.exit(1)
    }
  } else {
    logWarn(`Market file doesn't exist on path: ${args.marketPath}`)
    process.exit(1)
  }

  // Instantiate file writer
  const fileWriter = new FileWriter(args.marketPath, [], false)

  // Validate user file configuration
  configValidator = new ConfigValidator(args.configPath)
  try {
    await configValidator.isValid()
    await configValidator.normalize()
    configInstance = configValidator.getConfig()
  } catch (error) {
    logError(error)
    process.exit(1)
  }

  if (args.amountOfTokens && args.amountOfTokens > 0) {
    configInstance.wrapTokens = true
    configInstance.amountOfTokens = args.amountOfTokens
  }

  logSuccess('Your market file content:')
  logInfo(JSON.stringify(marketFile, undefined, 4))
  // Display user tokens balance
  await printTokenBalance(configInstance)
  await printAccountBalance(configInstance)
  // Ask user to confirm the input JSON description or stop the process
  askConfirmation('Do you wish to continue?')

  // Get current market step from market file
  let marketFileCopy = marketFile.slice()
  let abort = false

  // Start deploy process
  logInfo(`Starting ${executionType}, it could take up to 1 minute...`)

  if (configInstance.wrapTokens) {
    // wrap tokens
    try {
      logInfo(`Wrapping ${configInstance.amountOfTokens / 1e18 } tokens...`)
      tokenIstance = new Token(configInstance)
      await tokenIstance.wrapTokens(configInstance.amountOfTokens)
      logInfo('Tokens wrapped successfully')
    } catch (error) {
      logError(error)
      process.exit(1)
    }
  }

  try {
    for (let x in marketFileCopy) {
      let currentMarket = marketFileCopy[x]
      step = getMarketStep(currentMarket)
      let updatedMarket = await runProcessStack(configInstance, currentMarket, steps, step)
      marketFileCopy[x] = Object.assign(currentMarket, updatedMarket)
    }
    logInfo(`${executionType} done, writing updates to ${args.marketPath}`)
  } catch (error) {
    // Error logged to console by function raising the error
    logWarn('Writing updates before aborting...')
    abort = true
  } finally {
    fileWriter.setFilePath(args.marketPath)
    fileWriter.setData(marketFileCopy)
    fileWriter.write()
    if (abort) {
      logWarn('Updates written successfully, aborting')
      process.exit(1)
    } else {
      logSuccess(`Updates written successfully to ${args.marketPath}`)
    }
  }
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
  formatWinningOutcome,
  resolveMarket,
  runProcessStack,
  processArgs,
  consoleHelper,
  versionHelper,
  executor
}
