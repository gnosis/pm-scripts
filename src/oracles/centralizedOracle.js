class CentralizedOracle {
  constructor (eventDescription, configInstance) {
    this._eventDescription = eventDescription
    this._configInstance = configInstance
    this._ipfsHash = null
    this._oracleAddress = eventDescription.oracleAddress ? eventDescription.oracleAddress : null
  }

  async create () {
    const gasPrice = this._configInstance.gasPrice
    const ipfsHash = await this._configInstance.gnosisJS.publishEventDescription(this._eventDescription)
    const oracle = await this._configInstance.gnosisJS.createCentralizedOracle(ipfsHash, { gasPrice })
    this._ipfsHash = ipfsHash
    this._oracleAddress = oracle.address
  }

  getAddress () {
    return this._oracleAddress
  }

  getIpfsHash () {
    return this._ipfsHash
  }

  async isResolved () {
    const oracle = await this._configInstance.gnosisJS.contracts.CentralizedOracle.at(this._oracleAddress)
    return await oracle.isOutcomeSet()
  }

  async resolve (outcome) {
    const oracle = await this._configInstance.gnosisJS.contracts.CentralizedOracle.at(this._oracleAddress)
    return await oracle.setOutcome(outcome)
  }
}

module.exports = CentralizedOracle
