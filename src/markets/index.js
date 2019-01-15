import { MARKET_STAGES, TX_LOOKUP_TIME } from '../utils/constants'
import { logInfo, logSuccess } from '../utils/log'
import { isPlayMoneyToken, getPlayMoneyTokenInstance } from '../utils/tokens'
import CentralizedOracle from './../oracles/centralizedOracle'
import CategoricalEvent from './../events/categoricalEvent'
import ScalarEvent from './../events/scalarEvent'
import { promisify } from '@gnosis.pm/pm-js'
import sleep from 'sleep'

class Market {
  constructor (marketInfo, configInstance) {
    this._marketInfo = Object.assign({}, marketInfo)
    Object.assign(
      this._marketInfo,
      {
        event: configInstance.gnosisJS.contracts.Event.at(marketInfo.eventAddress),
        marketMaker: configInstance.gnosisJS.lmsrMarketMaker,
        gasPrice: configInstance.gasPrice,
        gas: configInstance.gasLimit
      }
    )
    this._configInstance = configInstance
    this._marketAddress = marketInfo.marketAddress || null
    this._transactionHash = null
  }

  /**
  * Creates a market.
  */
  async create () {
    try {
      const market = await this._configInstance.gnosisJS.createMarket(this._marketInfo)
      this._marketAddress = market.address
      this._transactionHash = market.transactionHash
    } catch (error) {
      throw error
    }
  }

  /**
  * Waits for a transaction to get mined. Returns True if the transaction goes through,
  * False otherwise.
  */
  async waitForMinedTransaction (transactionHash, transactionName) {
    let txReceipt
    const web3 = this._configInstance.blockchainProvider.getWeb3()

    while (true) {
      sleep.msleep(TX_LOOKUP_TIME)
      txReceipt = await promisify(web3.eth.getTransactionReceipt)(transactionHash)
      // the transaction receipt shall cointain the status property
      // which is [0, 1] for local ganache nodes, ['0x0' , '0x1'] on testnets
      if (!txReceipt) {
        continue
      } else if (txReceipt && (parseInt(txReceipt.status) === 0 || txReceipt.status === false)) {
        // handle error, transaction failed
        return false
      } else if (txReceipt && (parseInt(txReceipt.status) === 1 || txReceipt.status === true) && txReceipt.blockNumber != null) {
        return true
      }
    }
  }

  /**
  * Funds a Market, moves collateral token funds on the market.
  * Returns an array of Objects [ { "method": "methodName", "transactionHash": 0x... }]
  */
  async fund () {
    let txResponse, transactionMined, transactions = []
    const web3 = this._configInstance.blockchainProvider.getWeb3()
    const market = this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress)
    const collateralTokenInstance = this._configInstance.gnosisJS.contracts.Token.at(this._configInstance.collateralToken)
    const gasPrice = this._configInstance.gasPrice
    const gasLimit = this._configInstance.gasLimit

    // Check if token is play money token
    if (await isPlayMoneyToken(this._configInstance)) {
      const playTokenInstance = getPlayMoneyTokenInstance(this._configInstance)
      txResponse = await playTokenInstance.allowTransfers([
        this._marketInfo.marketAddress,
        this._marketInfo.eventAddress
      ])

      // First transaction check
      if (txResponse.receipt && parseInt(txResponse.receipt.status) === 0) {
        throw new Error(`Playtoken allowTransfers transaction for market ${this._marketAddress} failed.`)
      } else if (txResponse.receipt && parseInt(txResponse.receipt.status) === 1) {
        // success
        transactions.push({ "method": "allowTransfers", "transactionHash": txResponse.tx })
      }

      transactionMined = await this.waitForMinedTransaction(txResponse.tx, 'allowTransfers')
      if (!transactionMined) {
        throw new Error(`AllowTransfers transaction for market ${this._marketAddress} failed.`)
      } else {
        logInfo('AllowTransfers transaction was mined')
        transactions.push({ "method": "allowTransfers", "transactionHash": txResponse.tx })
      }
    }

    // Approve tokens transferral
    txResponse = await collateralTokenInstance.approve(this._marketAddress, this._marketInfo.funding)
    transactionMined = await this.waitForMinedTransaction(txResponse.tx, 'approve')
    if (!transactionMined) {
      throw new Error(`Approve transfer transaction for market ${this._marketAddress} failed.`)
    } else {
      logInfo('Approve  transfer transaction was mined')
      transactions.push({ "method": "approve", "transactionHash": txResponse.tx })
    }

    // // Fund market
    txResponse = await market.fund(this._marketInfo.funding, { gasPrice, gas: gasLimit })
    logInfo(`Waiting for funding transaction to be mined, tx hash: ${txResponse.tx}`)
    transactionMined = await this.waitForMinedTransaction(txResponse.tx, 'fund')
    if (!transactionMined) {
      throw new Error(`Funding transaction for market ${this._marketAddress} failed.`)
    } else {
      logInfo('Funding transaction was mined')
      transactions.push({ "method": "fund", "transactionHash": txResponse.tx })
    }

    // Return transactions dict
    return transactions
  }

  /**
  * Resolves a Market, sets the winning outcome on the Market's related Event and Oracle.
  * Returns an array of Objects [ { "method": "methodName", "transactionHash": 0x... }]
  */
  async resolve () {
    let oracle, outcomeSet, event, txReceipt
    let transactionMined, transactions = []
    let market = await this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress)
    let stage = await market.stage()
    const gasPrice = this._configInstance.gasPrice
    const gasLimit = this._configInstance.gasLimit

    if (stage.toNumber() === MARKET_STAGES.created) {
      throw new Error(`Market ${this._marketAddress} cannot be resolved. It must be in funded stage (current stage is CREATED)`)
    } else if (stage.toNumber() === MARKET_STAGES.closed) {
      throw new Error(`Market ${this._marketAddress} cannot be resolved. It must be in funded stage (current stage is CLOSED)`)
    } else {
      // Resolve market
      // await this._configInstance.gnosisJS.resolveEvent({event: this._marketInfo.event, outcome: this._marketInfo.winningOutcome})
      const web3 = this._configInstance.blockchainProvider.getWeb3()
      // Resolve oracle
      oracle = new CentralizedOracle(this._marketInfo, this._configInstance)
      if (!(await oracle.isResolved())) {
        logInfo('Setting outcome on the Oracle')
        const oracleTxResponse = await oracle.resolve(this._marketInfo.winningOutcome)
        logInfo(`Waiting for oracle setOutcome transaction to be mined, tx hash: ${oracleTxResponse.tx}`)

        transactionMined = await this.waitForMinedTransaction(oracleTxResponse.tx, 'oracleSetOutcome')
        if (!transactionMined) {
          throw new Error(`oracleSetOutcome transaction for market ${this._marketAddress} failed.`)
        } else {
          logInfo('Oracle setOutcome transaction was mined')
          transactions.push({ "method": "oracleSetOutcome", "transactionHash": oracleTxResponse.tx })
        }
      } else {
        logInfo('Oracle already resolved')
      }
      // Resolve event
      if (this._marketInfo.outcomeType === 'SCALAR') {
        event = new ScalarEvent(this._marketInfo, this._configInstance)
      } else {
        event = new CategoricalEvent(this._marketInfo, this._configInstance)
      }

      if (!(await event.isResolved())) {
        logInfo('Setting outcome on the Event')
        const eventTxResponse = await event.resolve()
        logInfo(`Waiting for event setOutcome transaction to be mined, tx hash: ${eventTxResponse.tx}`)

        transactionMined = await this.waitForMinedTransaction(eventTxResponse.tx, 'eventSetOutcome')
        if (!transactionMined) {
          throw new Error(`eventSetOutcome transaction for market ${this._marketAddress} failed.`)
        } else {
          logInfo('Event setOutcome transaction was mined')
          transactions.push({ "method": "eventSetOutcome", "transactionHash": eventTxResponse.tx })
        }
      } else {
        logInfo('Event already resolved')
      }

      // Close the market, so that it can't receive new trades
      const marketTxResponse = await market.close({ gasPrice, gas: gasLimit })

      // Wait for the transaction to take effect
      logInfo(`Waiting for market resolution process to complete...`)
      while (true) {
        oracle = await this._configInstance.gnosisJS.contracts.CentralizedOracle.at(this._marketInfo.oracleAddress)
        market = await this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress)
        stage = await market.stage()
        outcomeSet = await oracle.isOutcomeSet()
        if (stage.toNumber() === MARKET_STAGES.closed && outcomeSet) {
          break
        }
        sleep.msleep(TX_LOOKUP_TIME)
      }
      logSuccess(`Market ${this._marketAddress} resolved successfully`)
      transactionMined = await this.waitForMinedTransaction(marketTxResponse.tx, 'close')
      transactions.push({ "method": "close", "transactionHash": marketTxResponse.tx })
    }

    this._winningOutcome = this._marketInfo.winningOutcome

    // Return transactions dict
    return transactions
  }

  /**
  * Returns True whether a market was resolved, meaning that the winning outcome
  * is set on the Oracle.
  */
  async isResolved () {
    const oracle = await this._configInstance.gnosisJS.contracts.CentralizedOracle.at(this._marketInfo.oracleAddress)
    return oracle.isSet()
  }

  /**
  * Getters/Setters
  */

  setAddress (address) {
    this._marketAddress = address
  }

  getAddress () {
    return this._marketAddress
  }

  getData () {
    return this._marketInfo
  }

  getWinningOutcome () {
    return this._winningOutcome
  }

  async getStage () {
    return this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress).stage()
  }

  getTransactionHash () {
    return this._transactionHash
  }
}

module.exports = Market
