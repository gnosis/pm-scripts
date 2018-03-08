class ScalarEvent {
  constructor (eventInfo, configInstance) {
    this._eventInfo = Object.assign({}, eventInfo)
    Object.assign(
      this._eventInfo,
      {
        collateralToken: configInstance.collateralToken,
        gasPrice: configInstance.gasPrice,
        oracle: configInstance.gnosisJS.contracts.CentralizedOracle.at(eventInfo.oracleAddress)
      }
    )
    this._configInstance = configInstance
  }

  async create () {
    const event = await this._configInstance.gnosisJS.createScalarEvent(this._eventInfo)
    this._eventAddress = event.address
  }

  getAddress () {
    return this._eventAddress
  }
}

module.exports = ScalarEvent
