/**
* This scripts handles the resolution process of markets.
+ Once a markets gets resolved cannot accept bets anymore.
*/
import { readFile, fileExists } from './utils/os'
import { logInfo, logSuccess, logWarn, logError } from './utils/log'
import FileWriter from './utils/fileWriter'
import ConfigValidator from './validators/configValidator'
import {
  printTokenBalance, askConfirmation, getMarketStep, createOracle,
  createEvent, createMarket, fundMarket, resolveMarket, processArgs, runProcessStack
} from './utils/execution'

const steps = {
  '-1': [createOracle, createEvent, createMarket, fundMarket, resolveMarket],
  '0': [createEvent, createMarket, fundMarket, resolveMarket],
  '1': [createMarket, fundMarket, resolveMarket],
  '2': [resolveMarket],
  '3': [resolveMarket]
}

/**
*  Input params:
* -c : configuration file path, default /conf/config.json
* -m : market description file path, default /conf/market.json
* -w : wrap amount of tokens into ether token
*/
const main = async () => {
  let marketFile, step
  let configInstance, configValidator
  const args = processArgs(process.argv)

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

  logSuccess('Your market file content:')
  logInfo(JSON.stringify(marketFile, undefined, 4))
  // Display user tokens balance
  await printTokenBalance(configInstance)
  // Ask user to confirm or stop the process
  askConfirmation('Do you wish to continue?')

  // Get current market step from market file
  let marketFileCopy = marketFile.slice()
  let abort = false

  logInfo('Starting markets resolution...')
  try {
    for (let x in marketFileCopy) {
      let currentMarket = marketFileCopy[x]
      step = getMarketStep(currentMarket)
      let updatedMarket = await runProcessStack(configInstance, currentMarket, steps, step)
      marketFileCopy[x] = Object.assign(currentMarket, updatedMarket)
    }
    logInfo(`Resolution done, writing updates to ${args.marketPath}`)
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

/**
* Entry point
*/
main()
