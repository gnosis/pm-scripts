import { TX_LOOKUP_TIME } from '../utils/constants'
import { logInfo, logSuccess } from '../utils/log'
import { isPlayMoneyToken } from '../utils/tokens'
import { promisify } from '@gnosis.pm/pm-js'
import sleep from 'sleep'

class Token {
  constructor (configInstance) {
    this._configInstance = configInstance
  }

  /**
  * Deposit/issue ETH into a specific wrapped token.
  */
  async wrapTokens (amount) {
    let result

    if (!amount || amount <= 0) {
      throw new Error(`Cannot deposit invalid amounts of Ether, got ${amount} ETH`)
    }

    const gasPrice = this._configInstance.gasPrice
    const web3 = this._configInstance.blockchainProvider.getWeb3()
    let txReceipt

    if (await isPlayMoneyToken(this._configInstance) == true) {
      const playTokenContract = this._configInstance.gnosisJS.contracts.OlympiaToken.at(this._configInstance.collateralToken)
      result = await playTokenContract.issue([this._configInstance.account], amount, { gasPrice })
    } else {
      const etherTokenContract = this._configInstance.gnosisJS.contracts.EtherToken.at(this._configInstance.collateralToken)
      result = await etherTokenContract.deposit({ value: amount, gasPrice })
    }

    logInfo(`Waiting for Ether Wrapping transaction to be mined, tx hash: ${result.tx}`)

    while (true) {
      sleep.msleep(TX_LOOKUP_TIME)
      txReceipt = await promisify(web3.eth.getTransactionReceipt)(result.tx)

      if (!txReceipt) {
        continue
      } else if (txReceipt && (parseInt(txReceipt.status) === 0 || txReceipt.status === false)) {
        // handle error, transaction failed
        throw new Error('Ether wrapping transaction failed.')
      } else if (txReceipt && (parseInt(txReceipt.status) === 1 || txReceipt.status === true) && txReceipt.blockNumber != null) {
        break
      }
    }

    return result
  }

  /**
  * Returns the JSON representation of a Token, with relevant info.
  */
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
