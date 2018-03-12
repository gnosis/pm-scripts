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

  async fund () {
    const market = this._configInstance.gnosisJS.contracts.Market.at(this._marketInfo.marketAddress)
    const etherToken = this._configInstance.gnosisJS.contracts.EtherToken.at(this._configInstance.collateralToken)
    // Approve tokens transferral
    await etherToken.approve(this._marketInfo.marketAddress, this._marketInfo.funding)
    // Fund market
    await market.fund(this._marketInfo.funding)
  }

  setAddress (address) {
    this._marketAddress = address
  }

  getAddress () {
    return this._marketAddress
  }
}

module.exports = Market
