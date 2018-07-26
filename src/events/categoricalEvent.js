import BaseEvent from './baseEvent'

class CategoricalEvent extends BaseEvent {
  constructor (eventInfo, configInstance) {
    super()
    this._eventInfo = Object.assign({}, eventInfo)
    this._eventAddress = this._eventInfo.eventAddress
    Object.assign(
      this._eventInfo,
      {
        collateralToken: configInstance.collateralToken,
        outcomeCount: eventInfo.outcomes.length,
        gasPrice: configInstance.gasPrice,
        oracle: configInstance.gnosisJS.contracts.CentralizedOracle.at(eventInfo.oracleAddress)
      }
    )
    this._configInstance = configInstance
  }

  async create () {
    const event = await this._configInstance.gnosisJS.createCategoricalEvent(this._eventInfo)
    this._eventAddress = event.address
  }

  getAddress () {
    return this._eventAddress
  }
}

module.exports = CategoricalEvent
