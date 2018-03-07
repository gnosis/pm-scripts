import Web3 from 'web3'
import HDWalletProvider from 'truffle-hdwallet-provider'
import { promisify } from '@gnosis.pm/gnosisjs'

class Client {
  constructor (mnemonic, providerUrl, numAccounts = 1) {
    this._providerUrl = providerUrl
    this._provider = new HDWalletProvider(mnemonic, providerUrl, numAccounts)
    this._web3 = new Web3(this._provider)
  }

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
