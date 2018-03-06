import BaseValidator from './baseValidator'
import ValidationError from './exceptions'
import Client from '../clients/ethereum'
import fs from 'fs'

class ConfigValidator extends BaseValidator {
  constructor (configPath) {
    super()
    this._configPath = configPath
    this._fields = [
      {
        'name': 'mnemonic',
        'validators': ['required']
      },
      {
        'name': 'blockchain',
        'validators': ['httpObject']
      },
      {
        'name': 'collateralToken',
        'validators': ['requiredEthAddress']
      },
      {
        'name': 'account',
        'setters': ['declaredOrDefaultAccount'],
        'validators': ['hasBalance']
      }
    ]
  }

  /**
  * Read and convert the configuration into a Javascript object.
  * @throws: Error
  */
  load () {
    // read file
    const config = fs.readFileSync(this._configPath)
    // convert Bytes to JSON
    this._config = JSON.parse(config)
  }

  getConfig () {
    return this._config
  }

  setConfig (config) {
    this._config = config
  }

  getProviderUrl () {
    return `${this._config.blockchain.protocol}://${this._config.blockchain.host}:${this._config.blockchain.port}`
  }

  /**
  * Run validators
  * @throws ValidationError
  */
  runValidators (field) {
    field.validators.forEach(item => {
      if (!this[item](this._config[field.name])) {
        throw new ValidationError(`JSON Configuration field ${field.name} didn't pass ${item} validation. Got: ${this._config[field.name]}`)
      }
    })
    return true
  }

  /**
  * @return True if the configuration if valid, throws an error otherwise
  * @throws Error
  */
  isValid () {
    // Load configuration
    this.load()
    // Verify if has read/write permissions

    // Do validation
    for (let x = 0; x < this._fields.length; x++) {
      const field = this._fields[x]

      // TODO: review
      // if (!(field.name in this._config)) {
      //   throw new ValidationError(`JSON Configuration field ${field.name} is required. Got: ${this._config[field.name]}`)
      // }

      // If setters is defined, let's iterate over it first
      if (field.setters) {
        for (let y = 0; y < field.setters.length; y++) {
          let setter = field.setters[y]
          this[setter](this._config[field.name])
        }
        this.runValidators(field)
      } else {
        this.runValidators(field)
      }
    }

    // Normalize configuration (eth address lowercase, inject wallet instance etc.)

    return true
  }

  /**
  * Custom validators
  */
  async declaredOrDefaultAccount (account) {
    if (!this.requiredEthAddress(account)) {
      // Get default account
      const providerUrl = this.getProviderUrl()
      const client = new Client(this._config.mnemonic, providerUrl, 1)
      const accounts = await client.getAccounts()
      this._config.account = accounts[0]
    } else {
      this._config.account = account
    }
  }

  async hasBalance (account) {
    let balance
    const providerUrl = this.getProviderUrl()
    const client = new Client(this._config.mnemonic, providerUrl)

    if (this.requiredEthAddress(account)) {
      balance = await client.getBalance(account)
      return (balance > 0)
    } else if (!this.requiredEthAddress(this._config.account)) {
      balance = await client.getBalance(account)
      return (balance > 0)
    } else {
      return false
    }
  }
}

module.exports = ConfigValidator
