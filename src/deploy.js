/**
* This scripts handles the deployment process of new markets.
+ Provides also the market with funds.
*/
import { readFile, fileExists } from './utils/os'
import { DEFAULT_CONFIG_FILE_PATH, DEFAULT_MARKET_FILE_PATH } from './utils/constants'
import { logInfo, logSuccess, logWarn, logError } from './utils/log'
import FileWriter from './utils/fileWriter'
import ConfigValidator from './validators/configValidator'
import MarketValidator from './validators/marketValidator'
import Token from './tokens'
import minimist from 'minimist'
import {
  printBalance, askConfirmation, getMarketStep, createOracle,
  createEvent, createMarket, fundMarket
} from './utils/execution'

const runProcessStack = async (configInstance, marketDescription, step) => {
  // Validate market description
  const marketValidator = new MarketValidator(marketDescription)
  try {
    marketValidator.isValid()
  } catch (error) {
    logWarn(error)
    process.exit(1)
  }

  const steps = {
    '-1': [createOracle, createEvent, createMarket, fundMarket],
    '0': [createEvent, createMarket, fundMarket],
    '1': [createMarket, fundMarket],
    '2': [fundMarket],
    '3': [] // market resolution non handled on this script
  }

  for (let x in steps[step]) {
    //
    try {
      marketDescription = await steps[step][x](marketDescription, configInstance)
    } catch (error) {
      logError(`Got an execption on step ${step}`)
      logError(error.message)
      throw error
    }
  }

  // // Fund market
  // logInfo(`Funding market ${marketDescription.marketAddress}...`)
  // marketDescription = await fundMarket(marketDescription, configInstance)
  // logInfo('Market funded successfully')

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
      logInfo(`Asked to wrap ${args.w} tokens`)
      amountOfTokens = args.w
    } else if (args.w) {
      logWarn('Invalid -w parameter, skipping tokens wrapping step')
    }
  }

  // If the provided (or default) market file doesn't exist,
  // raise an error and abort
  if (fileExists(marketPath)) {
    // read market file JSON content
    try {
      marketFile = readFile(marketPath)
    } catch (error) {
      // File format not JSON compatible
      logError(`File ${marketPath} is not JSON compliant, please modify it.`)
      process.exit(1)
    }
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
  logSuccess('Your market file content:')
  logInfo(JSON.stringify(marketFile, undefined, 4))

  // Ask user to confirm the input JSON description or stop the process
  askConfirmation()

  // Get current market step from market file
  let marketFileCopy = marketFile.slice()
  let abort = false

  // Start deploy process
  logInfo('Starting deploy...')

  if (amountOfTokens && amountOfTokens > 0) {
    // wrap tokens
    try {
      logInfo(`Wrapping ${amountOfTokens} tokens...`)
      tokenIstance = new Token(configInstance)
      await tokenIstance.wrapTokens(amountOfTokens)
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
      let updatedMarket = await runProcessStack(configInstance, currentMarket, step)
      marketFileCopy[x] = Object.assign(currentMarket, updatedMarket)
    }
    logInfo(`Deploy done, writing updates to ${marketPath}`)
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
      logSuccess(`Updates written successfully to ${marketPath}`)
    }
  }
}

/**
* Entry point
*/
main()
