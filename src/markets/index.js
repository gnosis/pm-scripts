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
    this._marketAddress = null
  }

  async create () {
    const market = await this._configInstance.gnosisJS.createMarket(this._marketInfo)
    this._marketAddress = market.address
  }

  formatWinningOutcome () {
    return this._marketInfo.outcomes ? this._marketInfo.outcomes[this._marketInfo.winningOutcome] : `${this._marketInfo.winningOutcome / (10 ^ this._marketInfo.decimals)} ${this._marketInfo.unit}`
  }
  async resolve () {
    const stage = await this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress).stage()
    if (stage === 1) {
      await this._configInstance.gnosisJS.contracts.Market.close()
    }
    await this._configInstance.gnosisJS.resolveEvent({event: this._marketInfo.event, outcome: this._marketInfo.winningOutcome})
  }

  getAddress () {
    return this._marketAddress
  }

  async getStage () {
    return this._configInstance.gnosisJS.contracts.Market.at(this._marketAddress).stage()
  }
}

module.exports = Market
