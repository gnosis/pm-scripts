import { ETH_ADDRESS_LENGTH } from '../constants'

class BaseValidator {
  /**
  * Validators
  */
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
