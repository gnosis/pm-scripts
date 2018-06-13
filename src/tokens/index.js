import { isPlayMoneyToken } from '../utils/tokens'

class Token {
  constructor (configInstance) {
    this._configInstance = configInstance
  }

  async wrapTokens (amount) {
    let result

    if (!amount || amount <= 0) {
      throw new Error(`Cannot deposit invalid amounts of Ether, got ${amount} ETH`)
    }

    if (await isPlayMoneyToken(this._configInstance) == true) {
      const playTokenContract = this._configInstance.gnosisJS.contracts.OlympiaToken.at(this._configInstance.collateralToken)
      result = await playTokenContract.issue([this._configInstance.account], amount)
    } else {
      const etherTokenContract = this._configInstance.gnosisJS.contracts.EtherToken.at(this._configInstance.collateralToken)
      result = await etherTokenContract.deposit({ value: amount })
    }
    return result
  }

  async getInfo () {
    const tokenContract = this._configInstance.gnosisJS.contracts.OlympiaToken.at(this._configInstance.collateralToken)
    const info = {}
    info['name'] = await tokenContract.name()
    info['symbol'] = await tokenContract.symbol()
    info['decimals'] = await tokenContract.decimals()
    return info
  }
}

module.exports = Token
