/**
* Event base class.
*/
class BaseEvent {

  /**
  * Returns True whether the winning outcome is set on the Event
  */
  async isResolved () {
    const event = await this._configInstance.gnosisJS.contracts.Event.at(this._eventAddress)
    return await event.isOutcomeSet()
  }

  /**
  * Resolves an Event, set the winning outcome.
  */
  async resolve () {
    const gasPrice = this._configInstance.gasPrice
    const event = await this._configInstance.gnosisJS.contracts.Event.at(this._eventAddress)
    return await event.setOutcome({ gasPrice })
  }
}

module.exports = BaseEvent
