class Token {
  constructor (configInstance) {
    this._configInstance = configInstance
  }

  async wrapTokens (amount) {
    if (!amount || amount <= 0) {
      throw new Error(`Cannot deposit inval amounts of Ether, got ${amount} ETH`)
    }

    const etherTokenContract = this._configInstance.gnosisJS.contracts.EtherToken.at(this._configInstance.collateralToken)
    const result = await etherTokenContract.deposit({ value: amount })
    return result
  }
}

module.exports = Token
