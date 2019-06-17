import { logInfo, logWarn, logError } from './../utils/log'
import { MARKET_STAGES } from './../utils/constants'
import { capitalizeFirstLetter } from './../utils/string'
import { getTransactionCost } from './../utils/ethereum'
import { formatWinningOutcome } from './utils'
import CentralizedOracle from './../oracles/centralizedOracle'
import CategoricalEvent from './../events/categoricalEvent'
import ScalarEvent from './../events/scalarEvent'
import Market from './../markets'


/**
* Creates an oracle instance, updates the market description passed in input.
*/
const createOracle = async (eventDescription, configInstance) => {
    const oracle = new CentralizedOracle(eventDescription, configInstance)
    if (eventDescription.ipfsHash) {
        logWarn('IPFS HASH is already defined in market definition, skipping `CentralizedOracle.publishEventDescription()` step')
    } else {
        logInfo('Publishing Event Description to IPFS...')
        await oracle.publishEventDescription()
        eventDescription.ipfsHash = oracle.getIpfsHash()
        logInfo(`Event Description saved to IPFS, check it out: ${configInstance.ipfsUrl}/api/v0/cat?stream-channels=true&arg=${eventDescription.ipfsHash}`)
    }

    try {
        logInfo('Creating Centralized Oracle...')
        await oracle.create()
    } catch (error) {
        logError(error)
        throw error
    }

    eventDescription.oracleAddress = oracle.getAddress()
    logInfo(`Centralized Oracle with address ${eventDescription.oracleAddress} created successfully`)

    // Get transaction cost
    const transactionCost = {
        "method": "createOracle",
        "cost": await getTransactionCost(oracle.getTransactionHash(), configInstance)
    }
    eventDescription.costs.push(transactionCost)
    logInfo(`Oracle creation Cost: ${transactionCost.cost / 1e9} ETH`)

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

    try {
        await event.create()
    } catch (error) {
        logError(error)
        throw error
    }

    eventDescription.eventAddress = event.getAddress()
    logInfo(`${capitalizedEventType} Event with address ${eventDescription.eventAddress} created successfully`)

    // Get transaction cost
    const transactionCost = {
        "method": "createEvent",
        "cost": await getTransactionCost(event.getTransactionHash(), configInstance)
    }
    eventDescription.costs.push(transactionCost)
    logInfo(`Event creation Cost: ${transactionCost.cost / 1e9} ETH`)

    return eventDescription
}


/**
* Creates a market instance, updates the input market description.
*/
const createMarket = async (marketDescription, configInstance) => {
    logInfo('Creating market...')
    const market = new Market(marketDescription, configInstance)

    try {
        await market.create()
    } catch (error) {
        logError(error)
        throw error
    }

    marketDescription.marketAddress = market.getAddress()
    logInfo(`Market with address ${marketDescription.marketAddress} created successfully, check it out: ${configInstance.tradingDBUrl}/api/markets/${marketDescription.marketAddress}`)

    // Get transaction cost
    const transactionCost = {
        "method": "createMarket",
        "cost": await getTransactionCost(market.getTransactionHash(), configInstance)
    }
    marketDescription.costs.push(transactionCost)
    logInfo(`Market creation Cost: ${transactionCost.cost / 1e9} ETH`)

    return marketDescription
}


/**
* Funds a market instance.
*/
const fundMarket = async (marketDescription, configInstance) => {
    let transactions, cost
    logInfo(`Funding market with address ${marketDescription.marketAddress}...`)
    const market = new Market(marketDescription, configInstance)
    market.setAddress(marketDescription.marketAddress)
    try {
        transactions = await market.fund()
    } catch (error) {
        logError(error)
        logError('Are you sure you have enough collateral tokens for funding the market?')
        throw error
    }

    logInfo('Market funded successfully')

    // Get transaction costs for each transaction in fund market process
    for (let idx in transactions) {
        let transaction = transactions[idx]
        cost = await getTransactionCost(transaction.transactionHash, configInstance)

        const transactionCost = {
            "method": transaction.method,
            "cost": cost
        }
        marketDescription.costs.push(transactionCost)
        logInfo(`Market ${transaction.method} Cost: ${transactionCost.cost / 1e9} ETH`)
    }

    return marketDescription
}

/**
* Resolves a market only if winningOutcome is defined in the markets configuration
* file.
*/
const resolveMarket = async (marketDescription, configInstance) => {
    let transactions, cost

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
                transactions = await market.resolve()
                logInfo(`Market with address ${marketDescription.marketAddress} resolved successfully with outcome ${formatWinningOutcome(marketDescription)}`)
            } catch (error) {
                logError(error)
            }

            // Get transaction costs for each transaction in fund market process
            for (let idx in transactions) {
                let transaction = transactions[idx]
                cost = await getTransactionCost(transaction.transactionHash, configInstance)

                const transactionCost = {
                    "method": transaction.method,
                    "cost": cost
                }
                marketDescription.costs.push(transactionCost)
                logInfo(`Market ${transaction.method} Cost: ${transactionCost.cost / 1e9} ETH`)
            }
        }
    }
    return marketDescription
}

const deploySteps = {
    'oracleAddress': {
        'name': 'oracleAddress',
        'function': createOracle,
        'next': 'eventAddress'
    },
    'eventAddress': {
        'name': 'eventAddress',
        'function': createEvent,
        'next': 'marketAddress'
    },
    'marketAddress': {
        'name': 'marketAddress',
        'function': createMarket,
        'next': 'fundMarket'
    },
    'fundMarket': {
        'name': 'fundMarket',
        'function': fundMarket,
        'next': null
    }
}

const resolutionSteps = {
    'resolveMarket': {
        'name': 'resolveMarket',
        'function': resolveMarket,
        'next': null
    },
    'winningOutcome': {
        'name': 'winningOutcome',
        'function': () => {},
        'next': null
    }
}

module.exports = {
    deploySteps,
    resolutionSteps
}