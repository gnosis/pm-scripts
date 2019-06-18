import FileWriter from '../utils/fileWriter'

import {
  askConfirmation, getMarketsFile, getValidConfigFile, processArgs, printTokenBalance,
  printAccountBalance, runProcessStack, wrapTokens
} from './utils'

import { logSuccess, logInfo, logWarn } from './../utils/log'


/**
* Main executor, executes the entire stack flow for each market provided.
* 
* @param {*} args {Object}, it accepts the following 
* @param {*} executionType {String} - see src/utils/constants.js/EXECUTION_TYPES
*/
const executor = async (args, executionType) => {
  // It's used in try-catch-finally block to handle soft-killing of the app.
  // If abort is true, then we'll write updates before stopping the application.
  let abort = false
  const parsedArgs = processArgs(args)
  //
  let marketFile = getMarketsFile(parsedArgs.marketPath, true)
  // Validate provided configuration and get an instance of the configuration
  const configInstance = await getValidConfigFile(parsedArgs, true)

  // Display user tokens balance
  await printTokenBalance(configInstance)
  await printAccountBalance(configInstance)

  // Ask user for confirmation and continue or stop the process
  askConfirmation('Do you wish to continue?')

  if (configInstance.wrapTokens) {
    await wrapTokens(configInstance)
    // Mark wrapTokens as false, no more need to wrap tokens
    configInstance.wrapTokens = false
  }

  // Start deploy/resolve process
  logInfo(`Starting ${executionType}, it could take time...`)

  // Get current market step from market file
  const marketFileCopy = marketFile.slice()
  try {
    for (let x in marketFileCopy) {
      let currentMarket = marketFileCopy[x]
      // Run the stack execution over the current market
      let updatedMarket = await runProcessStack(configInstance, currentMarket, executionType, parsedArgs.skipFundConfirmation)
      // Merge updates into the object containing the whole markets' definition
      marketFileCopy[x] = Object.assign(currentMarket, updatedMarket)
    }
    logInfo(`${executionType} done, writing updates to ${parsedArgs.marketPath}`)
  } catch (error) {
    // Error logged to console by function raising the error
    logWarn('Writing updates before aborting...')
    abort = true
  } finally {
    // Instantiate file writer and write updates before stopping the execution
    const fileWriter = new FileWriter(parsedArgs.marketPath, [], false)
    fileWriter.setFilePath(parsedArgs.marketPath)
    fileWriter.setData(marketFileCopy)
    fileWriter.write()
    if (abort) {
      logWarn('Updates written successfully, aborting')
      process.exit(1)
    } else {
      logSuccess(`Updates written successfully to ${parsedArgs.marketPath}`)
      process.exit(0)
    }
  }
}

module.exports = executor