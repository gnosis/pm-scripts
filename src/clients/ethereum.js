import Web3 from 'web3'
import HDWalletProvider from 'truffle-hdwallet-provider'

class Client {
  constructor (mnemonic, providerUrl, numAccounts = 1) {
    this._provider = new HDWalletProvider(mnemonic, providerUrl, numAccounts)
    this._web3 = new Web3(this._provider)
  }

  getWeb3 () {
    return this._web3
  }
}

module.exports = Client
