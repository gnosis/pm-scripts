import { MARKET_STAGES } from '../utils/constants'

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
    const market = await this._configInstance.gnosisJS.createMarket(this._marketInfo)
    this._marketAddress = market.address
  }

  async fund () {
    const market = this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress)
    const etherToken = this._configInstance.gnosisJS.contracts.EtherToken.at(this._configInstance.collateralToken)
    // Approve tokens transferral
    await etherToken.approve(this._marketAddress, this._marketInfo.funding)
    // // Fund market
    await market.fund(this._marketInfo.funding)
  }

  formatWinningOutcome () {
    return this._marketInfo.outcomes ? this._marketInfo.outcomes[this._marketInfo.winningOutcome] : `${this._marketInfo.winningOutcome / (10 ^ this._marketInfo.decimals)} ${this._marketInfo.unit}`
  }

  async resolve () {
    const market = await this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress)
    const stage = await market.stage()
    if (stage.toNumber() === MARKET_STAGES.created) {
      throw new Error(`Market ${this._marketAddress} cannot be resolved. It must be in funded stage (current stage is CREATED)`)
    } else if (stage.toNumber() === MARKET_STAGES.closed) {
      throw new Error(`Market ${this._marketAddress} cannot be resolved. It must be in funded stage (current stage is CLOSED)`)
    } else {
      await market.close() // this._configInstance.gnosisJS.contracts.Market.close()
      await this._configInstance.gnosisJS.resolveEvent({event: this._marketInfo.event, outcome: this._marketInfo.winningOutcome})
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
