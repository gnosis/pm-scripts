import moment from 'moment'
import { ETH_ADDRESS_LENGTH } from '../utils/constants'

const secp256k1 = require('secp256k1')

class BaseValidator {
  /**
  * Validators
  */

  isString (value) {
    return (typeof value === 'string')
  }

  numberRequired (value) {
    try {
      return (value !== undefined && value !== null && parseFloat(value) !== undefined)
    } catch (err) {
      return false
    }
  }

  futureDate (value) {
    let date
    if (!(value instanceof Date)) {
      date = new Date(value)
    } else {
      date = value
    }

    const currentDate = new Date()
    return (date >= currentDate)
  }

  validDate (value) {
    const validFormats = [
      'YYYY-MM-DD HH:mm:ss',     // '2006-10-25 14:30:59'
      'YYYY-MM-DD HH:mm:ss.SSS',  // '2006-10-25 14:30:59.000200'
      'YYYY-MM-DDTHH:mm:ss.SSSZ', // 2018-12-31T18:00:00.000Z
      'YYYY-MM-DDTHH:mm:ss',
      'YYYY-MM-DD HH:mm',        // '2006-10-25 14:30'
      'YYYY-MM-DD',              // '2006-10-25'
      'MM/DD/YYYY HH:mm:ss',     // '10/25/2006 14:30:59'
      'MM/DD/YYYY HH:mm:ss.fff',  // '10/25/2006 14:30:59.000200'
      'MM/DD/YYYY HH:mm',        // '10/25/2006 14:30'
      'MM/DD/YYYY',              // '10/25/2006'
      'MM/DD/YYYY HH:mm:ss',     // '10/25/06 14:30:59'
      'MM/DD/YY HH:mm:ss.fff',  // '10/25/06 14:30:59.000200'
      'MM/DD/YY HH:mm',        // '10/25/06 14:30'
      'MM/DD/YY',              // '10/25/06'
  ]

    let isValid = false
    for (let idx in validFormats) {
      isValid = moment(value, validFormats[idx], true).isValid()
      if (isValid) {
        break
      }
    }
    return isValid
  }

  arrayRequired (value, minlength) {
    return (value !== undefined && value !== null && value.length >= minlength)
  }

  required (value) {
    if (Array.isArray(value)) {
      return (
        value.filter(item => item !== null && item !== undefined && item.trim().length > 0) ===
        value.length
      )
    }

    return value !== null && value !== undefined && value.trim().length > 0
  }

  requiredEthAddress (value) {
    return (this.required(value) && value.trim().length === ETH_ADDRESS_LENGTH)
  }

  httpUrl (value) {
    const webUrlRegex = '(https?)://?[^s(["<,>]*.[^s[",><]*:[0-9]*'
    const regexResult = value.match(webUrlRegex)
    return this.required(value) && regexResult !== null && regexResult.length > 0
  }

  httpObject (httpObj) {
    return (this.required(httpObj.protocol) && this.required(httpObj.host) && this.required(httpObj.port))
  }

  validPrivateKey (privateKey) {
    return secp256k1.privateKeyVerify(Buffer.from(privateKey, 'hex'))
  }

  validCredential ([credentialType, accountCredential]) {
    if (credentialType === 'mnemonic') {
      return accountCredential.trim().split(/\s+/g).length >= 12
    } else if (credentialType === 'privateKey') {
      return this.validPrivateKey(accountCredential)
    }

    return false
  }

  objectPropertiesRequired (obj, properties = []) {
    let isValid = true
    if (obj !== null && obj !== undefined) {
      if (properties.length > 0) {
        for (let x in properties) {
          if (obj[properties[x]] === undefined || obj[properties[x]] === '') {
            isValid = false
            break
          }
        }
      }
    } else {
      isValid = false
    }
    return isValid
  }
}

export default BaseValidator
