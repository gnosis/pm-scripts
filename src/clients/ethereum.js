import Web3 from 'web3'
import HDWalletProviderMnemonic from 'truffle-hdwallet-provider'
import HDWalletProviderPrivKey from 'truffle-hdwallet-provider-privkey'
import { promisify } from '@gnosis.pm/pm-js'

class Client {
  constructor (credentialType, walletCredential, providerUrl, numAccounts = 1) {
    const useMnemonic = credentialType === 'mnemonic'

    this._providerUrl = providerUrl

    if (useMnemonic) {
      this._provider = new HDWalletProviderMnemonic(walletCredential, providerUrl, 0, numAccounts)
      this._web3 = new Web3(this._provider)
    } else {
      const privateKey = walletCredential.replace('0x', '')
      this._provider = new HDWalletProviderPrivKey(privateKey, providerUrl)
      this._web3 = new Web3(this._provider.engine)
    }
  }

  /**
  * Getters
  */

  getWeb3 () {
    return this._web3
  }

  getProvider () {
    return this._provider
  }

  async getAccounts () {
    return promisify(this._web3.eth.getAccounts)()
  }

  async getBalance (address) {
    // const requestData = {
    //   'jsonrpc': '2.0',
    //   'method': 'eth_getBalance',
    //   'params': [address, 'latest'],
    //   'id': 1
    // }
    //
    // const response = request(
    //   'POST',
    //   this._providerUrl,
    //   {
    //     json: requestData
    //   }
    // )
    // const jsonResponse = JSON.parse(response.getBody('utf8'))
    // const balance = parseFloat(jsonResponse.result)
    // return balance
    return promisify(this._web3.eth.getBalance)(address)
  }
}

module.exports = Client
