import BaseValidator from './baseValidator'
import { ValidationError, SystemCheckError } from './exceptions'
import Client from '../clients/ethereum'
import { HD_WALLET_ACCOUNTS } from '../utils/constants'
import { hasWriteDirectoryPerms } from '../utils/os'
import Gnosis from '@gnosis.pm/pm-js'
import olympiaArtifacts from '@gnosis.pm/olympia-token'
import fs from 'fs'

class ConfigValidator extends BaseValidator {
  constructor (configPath) {
    super()
    this._configPath = configPath
    this._fields = [
      {
        'name': 'useWallet',
        'validators': ['required']
      },
      {
        'name': ['mnemonic', 'privateKey'],
        'validators': ['oneIsRequired']
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

    this._systemCheks = [
      {
        'name': 'hasWritePermissions',
        'args': [this._configPath]
      }
    ]

    this._defaults = {
      'gnosisDB': {
        'protocol': 'https',
        'host': 'gnosisdb.rinkeby.gnosis.pm',
        'port': 443
      },
      'ipfs': {
        'protocol': 'https',
        'host': 'ipfs.infura.io',
        'port': 5001
      }
    }
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

  /**
  * Getters / Setters
  */

  getConfig () {
    return this._config
  }

  setConfig (config) {
    this._config = config
  }

  getClient (providerUrl) {
    if (!providerUrl) {
      providerUrl = this.getProviderUrl()
    }
    const client = new Client(
      this._config.credentialType,
      this._config.accountCredential,
      providerUrl
    )
    return client
  }

  getProviderUrl () {
    return `${this._config.blockchain.protocol}://${this._config.blockchain.host}:${this._config.blockchain.port}`
  }

  getGnosisDBUrl () {
    if (!this.objectPropertiesRequired(this._config.gnosisDB, ['protocol', 'host', 'port'])) {
      // use default
      return `${this._defaults.gnosisDB.protocol}://${this._defaults.gnosisDB.host}:${this._defaults.gnosisDB.port}`
    } else {
      return `${this._config.gnosisDB.protocol}://${this._config.gnosisDB.host}:${this._config.gnosisDB.port}`
    }
  }

  getIpfsObject () {
    if (!this.objectPropertiesRequired(this._config.ipfs, ['protocol', 'host', 'port'])) {
      return {
        'protocol': this._defaults.ipfs.protocol,
        'host': this._defaults.ipfs.host,
        'port': this._defaults.ipfs.port
      }
    }
    return this._config.ipfs
  }

  getIPFSUrl () {
    if (!this.objectPropertiesRequired(this._config.ipfs, ['protocol', 'host', 'port'])) {
      // use default
      return `${this._defaults.ipfs.protocol}://${this._defaults.ipfs.host}:${this._defaults.ipfs.port}`
    } else {
      return `${this._config.ipfs.protocol}://${this._config.ipfs.host}:${this._config.ipfs.port}`
    }
  }

  /**
  * Run validators
  * @param field, see _fields property
  * @throws ValidationError
  */
  async runValidators (field) {
    for (let field of this._fields) {
      let item = field.validators
      if (!await this[item](this._config[field.name])) {
        throw new ValidationError(`JSON Configuration field ${field.name} didn't pass ${item} validation. Got: ${this._config[field.name]}`)
      }
    }
    return true
  }

  /**
  * Executes system checks, raise error if something went wrong.
  * @param systemChecks, see _systemCheks property
  * @throws SystemCheckError
  */
  runSystemChecks (systemChecks) {
    for (let x = 0; x < systemChecks.length; x++) {
      let check = systemChecks[x]
      try {
        if (check.args && check.args.length > 0) {
          this[check.name](...check.args)
        } else {
          this[check.name]()
        }
      } catch (error) {
        throw error
      }
    }
  }

  /**
  * Normalizes the configuration.
  * Converts addresses to lowercase
  * Set blockchainUrl, blockchainProvider, gnosisDBUrl, ipfsUrl
  * Set GnosisJS instance
  * Keep blockchain, gnosisdb and ipfs objects
  * @return normalized configuration
  */
  async normalize () {
    const client = this.getClient()
    const newConfig = Object.assign({}, this._config)
    newConfig.account = newConfig.account.toLowerCase()
    newConfig.blockchainProvider = client
    newConfig.blockchainUrl = this.getProviderUrl()
    newConfig.gnosisDBUrl = this.getGnosisDBUrl()
    newConfig.ipfs = this.getIpfsObject()
    newConfig.ipfsUrl = this.getIPFSUrl()
    newConfig.collateralToken = newConfig.collateralToken.toLowerCase()
    // GnosisJS instance options
    const gnosisOptions = {
      ethereum: client.getProvider(),
      ipfs: newConfig.ipfs,
      gnosisdb: newConfig.gnosisDBUrl,
      defaultAccount: newConfig.account
    }

    // Create GnosisJS instance
    const gnosisjsInstance = await Gnosis.create(gnosisOptions)
    await gnosisjsInstance.importContracts(olympiaArtifacts, {
      OlympiaToken: 'olympiaToken',
      AddressRegistry: 'olympiaAddressRegistry',
      PlayToken: 'playToken'
    })
    newConfig.gnosisJS = gnosisjsInstance
    // Set new updated config
    this.setConfig(newConfig)
  }

  /**
  * @return True if the configuration if valid, throws an error otherwise
  * @throws Error
  */
  async isValid () {
    // Load configuration
    this.load()
    // Execute system checks, can raise errors, in that case stop the execution
    try {
      this.runSystemChecks(this._systemCheks)
    } catch (error) {
      // Exit on failure
      console.warn('System checks went wrong, aborting.', error)
      process.exit(1)
    }

    // Do validation
    for (let field of this._fields) {
      // If 'setters' property is defined, let's iterate over it first
      if (field.setters) {
        for (let y = 0; y < field.setters.length; y++) {
          let setter = field.setters[y]
          await this[setter](this._config[field.name])
        }
        await this.runValidators(field)
      } else {
        await this.runValidators(field)
      }
    }

    return true
  }

  /**
  * Custom validators
  */
  async declaredOrDefaultAccount (account) {
    if (!this.requiredEthAddress(account)) {
      // Get default account
      const client = this.getClient()
      const accounts = await client.getAccounts()
      this._config.account = accounts[0]
    } else {
      this._config.account = account
    }
  }

  async hasBalance (account) {
    let balance
    const providerUrl = this.getProviderUrl()
    const client = new Client(
      this._config.credentialType,
      this._config.accountCredential,
      providerUrl
    )

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

  /**
  * System checks
  */
  hasWritePermissions (directory) {
    const hasPerms = hasWriteDirectoryPerms(directory)
    if (!hasPerms) {
      throw new SystemCheckError(`You don't have enough permissions to write on ${directory}`)
    }
  }
}

module.exports = ConfigValidator
