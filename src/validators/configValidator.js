import BaseValidator from './baseValidator'
import ValidationError from './exceptions'
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
        'name': 'ethereumNodeUrl',
        'validators': ['required', 'httpUrl']
      },
      {
        'name': 'collateralToken',
        'validators': ['requiredEthAddress']
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

  /**
  * @return True if the configuration if valid, throws an error otherwise
  * @throws Error
  */
  isValid () {
    // Load configuration
    this.load()
    // Do validation
    for (let x = 0; x < this._fields.length; x++) {
      const field = this._fields[x]

      if (!(field.name in this._config)) {
        throw new ValidationError(`JSON Configuration field ${field.name} is required. Got: ${this._config[field.name]}`)
      }

      field.validators.forEach(item => {
        if (!this[item](this._config[field.name])) {
          throw new ValidationError(`JSON Configuration field ${field.name} didn't pass ${item} validation. Got: ${this._config[field.name]}`)
        }
      })
    }
    return true
  }
}

module.exports = ConfigValidator
