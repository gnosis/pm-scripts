class BaseEvent {

  async isResolved () {
    const event = await this._configInstance.gnosisJS.contracts.Event.at(this._eventAddress)
    return await event.isOutcomeSet()
  }

  async resolve () {
    const event = await this._configInstance.gnosisJS.contracts.Event.at(this._eventAddress)
    return await event.setOutcome()
  }
}

module.exports = BaseEvent
