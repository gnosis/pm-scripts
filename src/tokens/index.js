class Token {
  constructor (configInstance) {
    this._configInstance = configInstance
  }

  async wrapTokens (amount) {
    const etherTokenContract = this._configInstance.gnosisJS.contracts.EtherToken.at(this._configInstance.collateralToken)
    const result = await etherTokenContract.deposit({ value: amount })
    return result
  }
}

module.exports = Token
