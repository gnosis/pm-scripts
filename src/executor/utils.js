/**
* Collection of useful functions for the market creation/resolution process
*/

import readlineSync from 'readline-sync'
import minimist from 'minimist'

import {
  DEFAULT_CONFIG_FILE_PATH, DEFAULT_MARKET_FILE_PATH, EXECUTION_TYPES,
  MARKET_STAGES, SDK_VERSION
} from './../utils/constants'
import { logInfo, logError, logWarn } from './../utils/log'
import { readFile, fileExists } from './../utils/os'
import Client from './../clients/ethereum'
import CentralizedOracle from './../oracles/centralizedOracle'
import CategoricalEvent from './../events/categoricalEvent'
import ScalarEvent from './../events/scalarEvent'
import Token from './../tokens'
import Market from './../markets'
import MarketValidator from './../validators/marketValidator'
import ConfigValidator from './../validators/configValidator'
import { claimRewards } from './../utils/rewards'
import { claimRewardsSteps, deploySteps, resolutionSteps } from './steps'


/**
* Prints out information about the configuration file content
* See ConfigValidator.normalize()
*/
const printConfiguration = (configuration) => {
  logInfo('=========== Configuration ===========')
  logInfo(`===== Account: ${configuration.account}`)
  logInfo(`===== Blockchain: ${configuration.blockchainUrl}`)
  logInfo(`===== TradingDB: ${configuration.tradingDBUrl}`)
  logInfo(`===== IPFS: ${configuration.ipfsUrl}`)
  logInfo(`===== Gas Price: ${configuration.gasPrice}`)
  logInfo(`===== Gas Limit: ${configuration.gasLimit}`)
  logInfo(`===== Collateral Token: ${configuration.collateralToken}`)
  logInfo('=====================================')
}

/**
* Prints out the token balance of the account defined in the configuration
*/
const printTokenBalance = async configInstance => {
  const etherToken = await configInstance.gnosisJS.contracts.WETH9.at(configInstance.collateralToken)
  const tokenInfo = await new Token(configInstance).getInfo()
  const balance = (await etherToken.balanceOf(configInstance.account)) / 1e18
  const tokenName = tokenInfo.name !== undefined ? tokenInfo.name : 'Wrapped Ether Token'
  const tokenSymbol = tokenInfo.symbol !== undefined ? tokenInfo.symbol : 'WETH'
  let message = `Your current collateral token balance is ${balance} ${tokenSymbol} (${tokenName})`

  if (configInstance.wrapTokens && configInstance.wrapTokens === true) {
    message += `, will wrap ${configInstance.amountOfTokens / 1e18} ${tokenSymbol} (${tokenName}) more`
  }
  logInfo(message)
}

/**
* Prints out the market deployment costs
*/
const printMarketCosts = marketDescription => {
  let total = 0

  logInfo('===== Deployment costs recap =====')

  marketDescription.costs.forEach(costObj => {
    logInfo(`===== ${costObj.method}: ${costObj.cost / 1e9} ETH`)
    total += costObj.cost
  })

  logInfo(`===== TOTAL: ${total / 1e9} ETH`)
  logInfo('==================================\n')
}

/**
* Prints out the current setted ethereum account and balance
*/
const printAccountBalance = async configInstance => {
  const client = new Client(
    configInstance.credentialType,
    configInstance.accountCredential,
    configInstance.blockchainUrl
  )
  const balance = (await client.getBalance(configInstance.account)) / 1e18
  logInfo(`Your Ethereum address is ${configInstance.account}`)
  logInfo(`Your account balance is ${balance} ETH`)
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
  const steps = {}
  steps[EXECUTION_TYPES.deploy] = deploySteps
  steps[EXECUTION_TYPES.resolve] = resolutionSteps
  steps[EXECUTION_TYPES.claimRewards] = claimRewardsSteps

  const lookupSteps = steps[executionType]

  if (!lookupSteps) {
    throw new Error(`${executionType} doesn't have any execution steps associated with it.`)
  }

  for (let key in lookupSteps) {
    if (!(key in marketDescription)) {
      return lookupSteps[key]
    }
    else if (key in marketDescription && !marketDescription[key]) { // if value is empty
      return lookupSteps[key]
    }
  }

  return null
}


/**
* Returns a formatted string representing the winning outcome
* accordingly the market type and the decimals in case of Scalar markets.
*/
const formatWinningOutcome = marketInfo => {
  const formattedOutcome = marketInfo.outcomes ? marketInfo.outcomes[marketInfo.winningOutcome] : `${marketInfo.winningOutcome / (10 ** marketInfo.decimals)} ${marketInfo.unit}`
  if (!formattedOutcome) {
    throw Error(`An invalid winning outcome was provided, an number was expected, got \`${marketInfo.winningOutcome}\` instead, please review it in your markets file.`)
  }
  return formattedOutcome
}

/**
* Check if market was resolved.
* Returns True if market resolved, False otherwise
*/
const isMarketResolved = async (marketDescription, configInstance) => {
  if (marketDescription.marketAddress) {
    logInfo(`Check if market ${marketDescription.marketAddress} was already resolved...`)
    const market = new Market(marketDescription, configInstance)
    const marketResolved = await market.isResolved()

    let event
    if (marketDescription.outcomeType === 'SCALAR') {
      event = new ScalarEvent(marketDescription, configInstance)
    } else {
      event = new CategoricalEvent(marketDescription, configInstance)
    }

    const eventResolved = await event.isResolved()

    const oracle = new CentralizedOracle(marketDescription, configInstance)
    const oracleResolved = await oracle.isResolved()

    return (marketResolved && eventResolved && oracleResolved)

  } else {
    return false
  }

}

/**
* Check if market was resolved.
* Returns True if market resolved, False otherwise
*/
const isMarketFunded = async (marketDescription, configInstance) => {
  logInfo(`Check if market ${marketDescription.marketAddress} was already funded...`)
  const market = new Market(marketDescription, configInstance)
  const stage = await market.getStage()

  return (stage.toNumber() === MARKET_STAGES.funded)
}


/**
 * 
 * @param {*} filePath 
 * @param {*} print 
 */
const getMarketsFile = (filePath, print) => {
  let marketFile
  // If the provided (or default) market file doesn't exist,
  // raise an error and abort
  if (fileExists(filePath)) {
    // read market file JSON content
    try {
      marketFile = readFile(filePath)
    } catch (error) {
      // File format not JSON compatible
      logError(`The file at ${filePath} is not JSON compliant, please choose a valid JSON file.`)
      process.exit(1)
    }
  } else {
    logWarn(`Markets file doesn't exist on path: ${filePath}`)
    process.exit(1)
  }

  if (print) {
    logInfo('====== Market file content ======')
    logInfo(JSON.stringify(marketFile, undefined, 4))
  }

  return marketFile
}

/**
 * Returns an instance of the configuration if valid, raises an exception otherwise.
 * @param {*} args 
 * @param {*} print {Bool} - If true, prints the configuration out to the console
 */
const getValidConfigFile = async (args, print) => {
  // Validate user file configuration
  const configValidator = new ConfigValidator(args.configPath)

  let configInstance
  try {
    await configValidator.isValid()
    await configValidator.normalize()
    configInstance = configValidator.getConfig()
  } catch (error) {
    logError(error)
    throw error
  }

  if (args.amountOfTokens && args.amountOfTokens > 0) {
    configInstance.wrapTokens = true
    configInstance.amountOfTokens = args.amountOfTokens
  }

  if (print) {
    printConfiguration(configValidator.getConfig())
  }

  return configInstance
}

/**
 * 
 * @param {*} configInstance 
 */
const wrapTokens = async configInstance => {
  // wrap tokens
  try {
    logInfo(`Wrapping ${configInstance.amountOfTokens / 1e18} tokens...`)
    const tokenInstance = new Token(configInstance)
    await tokenInstance.wrapTokens(configInstance.amountOfTokens)
    logInfo('Tokens wrapped successfully')
    // print updated balance
    await printTokenBalance(configInstance)
  } catch (error) {
    logError(error)
    process.exit(1)
  }
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
const runProcessStack = async (configInstance, marketDescription, executionType, skipFundConfirmation) => {
  try {
    // Validate market description
    const marketValidator = new MarketValidator(marketDescription)
    marketValidator.isValid()
  } catch (error) {
    logWarn(error)
    throw error
  }

  if (!marketDescription.costs) {
    marketDescription.costs = []
  }
  
  let currentStep
  while (true) {
    // Get step to execute
    currentStep = getMarketStep(marketDescription, executionType)

    if (!currentStep) { // no more steps to execute
      break;
    } else {
      // Check if the market is already resolved
      const isResolved = await isMarketResolved(marketDescription, configInstance)

      // FUND MARKET
      if (currentStep.name === 'fundMarket') {
        if (isResolved) {
          logInfo(`Market ${marketDescription.marketAddress} looks to be resolved, skipping fund step`)
          // skip
          break
        }

        // Check if the market was already funded
        const isFunded = await isMarketFunded(marketDescription, configInstance)

        if (isFunded) {
          logInfo(`Market ${marketDescription.marketAddress} was already funded, skipping fund step`)
          // skip
          break
        }
        if (!skipFundConfirmation && !askConfirmation(`Do you wish to fund the market ${marketDescription.marketAddress}?`, false)) {
          // skip
          break
        }
      }

      // RESOLVE MARKET
      if (currentStep.name === 'resolveMarket') {
        if (marketDescription.winningOutcome !== undefined) {
          if (!isResolved) {
            // If categorical event, check the winning outcome is within the list of outcomes
            if (marketDescription.outcomeType == 'CATEGORICAL' && 
                (parseInt(marketDescription.winningOutcome) >= marketDescription.outcomes.length || parseInt(marketDescription.winningOutcome) < 0)) {
              logWarn(`Winning outcome ${marketDescription.winningOutcome} out of index, please check the \`outcomes\` property on your market description`)
              break
            }

            // Get a human readable representation of the outcome set
            try {
              const formattedOutcome = formatWinningOutcome(marketDescription)
              if (!askConfirmation(`Do you wish to resolve the market ${marketDescription.marketAddress} with outcome \`${formattedOutcome}\`?`, false)) {
                // skip
                break
              } 
            } catch (error) {
              logError(error)
              throw error
            }
          } else {
            logInfo(`Market ${marketDescription.marketAddress} is already resolved, skipping it`)
            break
          }
        } else {
          logInfo(`Market ${marketDescription.marketAddress} has no \`winningOutcome\` property set, skipping it`)
          break
        }
      }
  
      try {
        logInfo(`Ready to execute \`${currentStep.extendedName}\``)
        // Execute step's function
        marketDescription = await currentStep.function(marketDescription, configInstance)
        // Print market creation/resolution costs recap if we're on last step
        if (!currentStep.next) {
          // Print costs recap
          printMarketCosts(marketDescription)
        }
      } catch (error) {
        logError(error)
        throw error
      }
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
  askConfirmation,
  claimRewards, 
  formatWinningOutcome,
  getMarketsFile,
  getValidConfigFile,
  processArgs,
  printAccountBalance,
  printTokenBalance,
  runProcessStack,
  wrapTokens,
}
