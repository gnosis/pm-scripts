class CentralizedOracle {
  constructor (eventDescription, configInstance) {
    this._eventDescription = eventDescription
    this._configInstance = configInstance
    this._ipfsHash = null
    this._oracleAddress = eventDescription.oracleAddress ? eventDescription.oracleAddress : null
  }

  /**
  * Publishes an Event Description in JSON format to IPFS
  */
  async publishEventDescription () {
    this._ipfsHash = await this._configInstance.gnosisJS.publishEventDescription(this._eventDescription)
  }

  /**
  * Creates a Centralized Oracle
  */
  async create () {
    const gasPrice = this._configInstance.gasPrice
    const oracle = await this._configInstance.gnosisJS.createCentralizedOracle(this._ipfsHash, { gasPrice })
    this._oracleAddress = oracle.address
  }

  /**
  * Returns True if the Outcome is set on the Oracle, False otherwise.
  */
  async isResolved () {
    const oracle = await this._configInstance.gnosisJS.contracts.CentralizedOracle.at(this._oracleAddress)
    return await oracle.isOutcomeSet()
  }

  /**
  * Resolves a Centralized Oracle, sets the winning outcome on the Oracle.
  */
  async resolve (outcome) {
    const gasPrice = this._configInstance.gasPrice
    const oracle = await this._configInstance.gnosisJS.contracts.CentralizedOracle.at(this._oracleAddress)
    return await oracle.setOutcome(outcome, { gasPrice })
  }

  /**
  * Getters
  */

  getAddress () {
    return this._oracleAddress
  }

  getIpfsHash () {
    return this._ipfsHash
  }
}

module.exports = CentralizedOracle
