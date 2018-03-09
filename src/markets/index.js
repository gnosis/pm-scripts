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

  getAddress () {
    return this._marketAddress
  }
}

module.exports = Market
