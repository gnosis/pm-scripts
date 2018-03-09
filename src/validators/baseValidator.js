import { ETH_ADDRESS_LENGTH } from '../utils/constants'

class BaseValidator {
  /**
  * Validators
  */

  isString (value) {
    return (typeof value === 'string')
  }

  numberRequired (value) {
    try {
      return (value !== undefined && value !== null && parseFloat(value))
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

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    futureDate.setHours(0, 0, 0, 0)
    return (date >= futureDate)
  }

  arrayRequired (value, minlength) {
    return (value !== undefined && value !== null && value.length >= minlength)
  }

  required (value) {
    return (value !== null && value !== undefined && value.trim().length > 0)
  }

  requiredEthAddress (value) {
    return (this.required(value) && value.trim().length === ETH_ADDRESS_LENGTH)
  }

  httpUrl (value) {
    const webUrlRegex = '(https?):\/\/?[^\s(["<,>]*\.[^\s[",><]*:[0-9]*'
    const regexResult = value.match(webUrlRegex)
    return (this.required(value) && regexResult !== null && regexResult.length > 0)
  }

  httpObject (httpObj) {
    return (this.required(httpObj.protocol) && this.required(httpObj.host) && this.required(httpObj.port))
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

module.exports = BaseValidator
