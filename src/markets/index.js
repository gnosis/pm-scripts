import { MARKET_STAGES, TX_LOOKUP_TIME } from '../utils/constants'
import { logInfo } from '../utils/log'
import { promisify } from '@gnosis.pm/gnosisjs'
import sleep from 'sleep'

class Market {
  constructor (marketInfo, configInstance) {
    this._marketInfo = Object.assign({}, marketInfo)
    Object.assign(
      this._marketInfo,
      {
        event: configInstance.gnosisJS.contracts.Event.at(marketInfo.eventAddress),
        marketMaker: configInstance.gnosisJS.lmsrMarketMaker,
        gasPrice: configInstance.gasPrice
      }
    )
    this._configInstance = configInstance
    this._marketAddress = marketInfo.marketAddress || null
  }

  async create () {
    try {
      const market = await this._configInstance.gnosisJS.createMarket(this._marketInfo)
      this._marketAddress = market.address
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async fund () {
    let txReceipt
    const market = this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress)
    const etherToken = this._configInstance.gnosisJS.contracts.EtherToken.at(this._configInstance.collateralToken)
    // Approve tokens transferral
    await etherToken.approve(this._marketAddress, this._marketInfo.funding)
    // // Fund market
    const txResponse = await market.fund(this._marketInfo.funding, { gas: 300000000 })
    // First transaction check
    if (txResponse.receipt && txResponse.receipt.status === 0) {
      throw new Error(`Funding transaction for market ${this._marketAddress} failed.`)
    } else if (txResponse.receipt && txResponse.receipt.status === 1) {
      return
    }
    logInfo(`Waiting for funding transaction to be mined, tx hash: ${txResponse.tx}`)
    const web3 = this._configInstance.blockchainProvider.getWeb3()
    while (true) {
      sleep.msleep(TX_LOOKUP_TIME)
      txReceipt = await promisify(web3.eth.getTransactionReceipt)(txResponse.tx)
      if (!txReceipt) {
        continue
      } else if (txReceipt && txReceipt.status === 0) {
        // handle error, transaction failed
        throw new Error(`Funding transaction for market ${this._marketAddress} failed.`)
      } else if (txReceipt && txReceipt.status === 1) {
        break
      }
    }
    logInfo('Funding transaction was mined')
  }

  formatWinningOutcome () {
    return this._marketInfo.outcomes ? this._marketInfo.outcomes[this._marketInfo.winningOutcome] : `${this._marketInfo.winningOutcome / (10 ^ this._marketInfo.decimals)} ${this._marketInfo.unit}`
  }

  async resolve () {
    let oracle, outcomeSet
    let market = await this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress)
    let stage = await market.stage()
    if (stage.toNumber() === MARKET_STAGES.created) {
      throw new Error(`Market ${this._marketAddress} cannot be resolved. It must be in funded stage (current stage is CREATED)`)
    } else if (stage.toNumber() === MARKET_STAGES.closed) {
      throw new Error(`Market ${this._marketAddress} cannot be resolved. It must be in funded stage (current stage is CLOSED)`)
    } else {
      // Resolve market
      await this._configInstance.gnosisJS.resolveEvent({event: this._marketInfo.event, outcome: this._marketInfo.winningOutcome})
      await market.close() // this._configInstance.gnosisJS.contracts.Market.close()
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
    }

    this._winningOutcome = this._marketInfo.winningOutcome
  }

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
}

module.exports = Market
