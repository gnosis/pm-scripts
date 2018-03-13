/**
* Collection of useful functions for the market creation process
*/
import { logSuccess, logInfo, logError } from './log'
import { capitalizeFirstLetter } from './string'
import CentralizedOracle from './../oracles/centralizedOracle'
import CategoricalEvent from './../events/categoricalEvent'
import ScalarEvent from './../events/scalarEvent'
import Market from './../markets'
import readlineSync from 'readline-sync'

const printBalance = async configInstance => {
  const etherToken = await configInstance.gnosisJS.contracts.EtherToken.at(configInstance.collateralToken)
  const balance = await etherToken.balanceOf(configInstance.account)
  logSuccess(`Your current collateral token balance is ${balance}`)
}

const askConfirmation = () => {
  if (!readlineSync.keyInYN('Do you wish to continue?')) {
    process.exit(0)
  }
}

const getMarketStep = marketDescription => {
  const steps = ['oracleAddress', 'eventAddress', 'marketAddress', 'winningOutcome']
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
  logInfo('Creating Centralized Oracle...')
  const oracle = new CentralizedOracle(eventDescription, configInstance)
  await oracle.create()
  eventDescription.oracleAddress = oracle.getAddress()
  logInfo(`Centralized Oracle with address ${eventDescription.oracleAddress} created successfully`)
  return eventDescription
}

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

const createMarket = async (marketDescription, configInstance) => {
  logInfo('Creating market...')
  const market = new Market(marketDescription, configInstance)
  await market.create()
  marketDescription.marketAddress = market.getAddress()
  logInfo(`Market with address ${marketDescription.marketAddress} created successfully`)
  return marketDescription
}

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

const resolveMarket = async (marketDescription, configInstance) => {
  logInfo(`Resolving Market with address ${marketDescription.marketAddress}...`)
  const market = new Market(marketDescription, configInstance)
  await market.resolve()
  logInfo(`Market with address ${marketDescription.marketAddress} resolved successfully with outcome ${market.formatWinningOutcome()}`)
  return marketDescription
}

module.exports = {
  printBalance,
  askConfirmation,
  getMarketStep,
  createOracle,
  createEvent,
  createMarket,
  fundMarket,
  resolveMarket
}
