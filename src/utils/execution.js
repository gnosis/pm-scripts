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
import { claimRewards } from './rewards'
import FileWriter from './fileWriter'
import Client from './../clients/ethereum'
import readlineSync from 'readline-sync'
import minimist from 'minimist'

/**
* Prints out the token balance of the account defined in the configuration
*/
const printTokenBalance = async configInstance => {
  const etherToken = await configInstance.gnosisJS.contracts.Token.at(configInstance.collateralToken)
  const tokenInfo = await new Token(configInstance).getInfo()
  const balance = (await etherToken.balanceOf(configInstance.account)) / 1e18
  const tokenName = tokenInfo.name !== undefined ? tokenInfo.name : 'Wrapped Ether Token'
  const tokenSymbol = tokenInfo.symbol !== undefined ? tokenInfo.symbol : 'WETH'
  let message = `Your current collateral token balance is ${balance} ${tokenSymbol} (${tokenName})`

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
const getMarketStep = (marketDescription, executionType) => {
  const steps = ['oracleAddress', 'eventAddress', 'marketAddress']

  if (executionType == 'resolve') {
    steps.push('winningOutcome')
  }

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
  if (marketDescription.winningOutcome === undefined) {
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
* Check if market was resolved.
* Returns True if market resolved, False otherwise
*/
const isMarketResolved = async (marketDescription, configInstance) => {
  if (marketDescription.marketAddress) {
    logInfo('Check market already resolved...')
    const market = new Market(marketDescription, configInstance)
    return await market.isResolved()
  } else {
    return false
  }

}

/**
* Check if market was resolved.
* Returns True if market resolved, False otherwise
*/
const isMarketFunded = async (marketDescription, configInstance) => {
  logInfo('Check market already funded...')
  const market = new Market(marketDescription, configInstance)
  const stage = await market.getStage()

  return (stage.toNumber() === MARKET_STAGES.funded)
}

/**
* Validates input args and sets default values eventually
*/
const processArgs = argv => {
  let configPath = DEFAULT_CONFIG_FILE_PATH
  let marketPath = DEFAULT_MARKET_FILE_PATH
  let amountOfTokens
  let parsedArgs

  // Arguments check
  if (argv.length === 2) {
    logWarn('Running SDK Utils with default parameters')
    parsedArgs = {
      configPath: DEFAULT_CONFIG_FILE_PATH,
      marketPath: DEFAULT_MARKET_FILE_PATH
    }
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

    parsedArgs = {
      configPath,
      marketPath,
      amountOfTokens
    }

    // Add claimrewards manually to the returning args
    if (argv.indexOf('claimrewards') > -1) {
      parsedArgs['claimrewards'] = true
    }

    // Check if user asked to skip confirmations when funding markets
    if (argv.indexOf('-skip-fund-confirmation') > -1) {
      logInfo('Asked to force funding all markets with no confirmation')
      parsedArgs['skipFundConfirmation'] = true
    } else {
      parsedArgs['skipFundConfirmation'] = false
    }

  }

  return parsedArgs
}

/**
* Runs the execution process stack.
* @params fundAllMarkets - if set to True force to fund all markets without asking for confirmation
*/
const runProcessStack = async (configInstance, marketDescription, steps, step, skipFundConfirmation) => {
  // Validate market description
  const marketValidator = new MarketValidator(marketDescription)
  try {
    marketValidator.isValid()
  } catch (error) {
    logWarn(error)
    process.exit(1)
  }

  let isFunded, isResolved

  // Check if the user is willing to resolve a market and if the market is already resolved
  isResolved = await isMarketResolved(marketDescription, configInstance)

  for (let x in steps[step]) {
    //
    try {
      if (steps[step][x].name === 'fundMarket') {
        if (isResolved) {
          logInfo(`Market ${marketDescription.marketAddress} looks to be resolved, skipping fund step`)
          // skip
          continue
        }

        // Check if the market was already funded
        isFunded = await isMarketFunded(marketDescription, configInstance)

        if (isFunded) {
          logInfo(`Market ${marketDescription.marketAddress} already funded, skipping fund step`)
          // skip
          continue
        }
        if (!skipFundConfirmation && !askConfirmation(`Do you wish to fund the market ${marketDescription.marketAddress}?`, false)) {
          // skip
          continue
        }
      }

      if (steps[step][x].name === 'resolveMarket') {
        if (marketDescription.winningOutcome !== undefined) {
          if (!isResolved) {
            const formattedOutcome = formatWinningOutcome(marketDescription)
            if (!askConfirmation(`Do you wish to resolve the market ${marketDescription.marketAddress} with outcome ${formattedOutcome}?`, false)) {
              // skip
              continue
            }
          } else {
            logInfo(`Market ${marketDescription.marketAddress} already resolved, skipping it`)
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
      if (step === -1) {
          logError('Got an execption')
      } else {
          logError(`Got an execption on step ${step}`)
      }
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
* -skip-fund-confirmation: skips fund markets confirmation
*/
const executor = async (args, executionType, steps) => {
  let marketFile, step
  let configInstance, configValidator, tokenInstance
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
      tokenInstance = new Token(configInstance)
      await tokenInstance.wrapTokens(configInstance.amountOfTokens)
      configInstance.wrapTokens = false
      logInfo('Tokens wrapped successfully')
      // print updated balance
      await printTokenBalance(configInstance)
    } catch (error) {
      logError(error)
      process.exit(1)
    }
  }

  if (args.claimrewards && args.claimrewards === true) {
    // Do claim rewards
    await claimRewards(configInstance)
  } else {

    try {
      for (let x in marketFileCopy) {
        let currentMarket = marketFileCopy[x]
        step = getMarketStep(currentMarket, executionType)
        let updatedMarket = await runProcessStack(configInstance, currentMarket, steps, step, args.skipFundConfirmation)
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
}

const consoleHelper = () => {
  console.info(`GNOSIS SDK - ${SDK_VERSION}`)
  console.info('Deploy usage: node lib/main.js deploy <commands>')
  console.info('Other usage: npm run deploy -- <commands>')
  console.info('Resolution usage: node lib/main.js resolve <commands>')
  console.info('Other resolution usage: npm run resolve -- <commands>')
  console.info('Claim rewards usage: node lib/main.js claimrewards')
  console.info('Other claim rewards usage: npm run claimrewards')
  console.info('Commands:')
  console.info('-f\tabsolute path to your configuration file.')
  console.info('-m\tabsolute path to your markets file.')
  console.info('-w\tamount of collateral tokens to wrap')
  console.info('-skip-fund-confirmation\tskip confirmations when funding markets from the market.json file')
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
