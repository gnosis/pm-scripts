class BaseEvent {

  async isResolved () {
    const event = await this._configInstance.gnosisJS.contracts.Event.at(this._eventAddress)
    return await event.isOutcomeSet()
  }

  async resolve () {
    const gasPrice = this._configInstance.gasPrice
    const event = await this._configInstance.gnosisJS.contracts.Event.at(this._eventAddress)
    return await event.setOutcome({ gasPrice })
  }
}

module.exports = BaseEvent
