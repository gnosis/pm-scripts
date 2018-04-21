import BaseValidator from './baseValidator'
import { ValidationError } from './exceptions'

class MarketValidator extends BaseValidator {
  constructor (marketObject) {
    super()
    this._market = marketObject
  }

  /**
  * @return True if the configuration if valid, throws an error otherwise
  * @throws Error
  */
  isValid () {
    const errors = []
    const prefix = '[Market Validation] '

    if (!this.required(this._market.title)) {
      errors.push(`${prefix} Title is required, got ${this._market.title}`)
    }
    if (!this.required(this._market.description)) {
      errors.push(`${prefix} Description is required, got ${this._market.description}`)
    }
    if (!this._market.marketAddress && !this.futureDate(this._market.resolutionDate)) {
      errors.push(`${prefix} If not deployed, ResolutionDate is required and must be greater than today, got ${this._market.resolutionDate}`)
    }
    if (!this.required(this._market.outcomeType)) {
      errors.push(`${prefix} OutcomeType is required, accepted values: 'SCALAR', 'CATEGORICAL', got ${this._market.outcomeType}`)
    }
    if (!this.validFee(this._market.fee)) {
      errors.push(`${prefix} Fee is required, got ${this._market.fee}`)
    }
    if (!this.numberRequired(this._market.funding)) {
      errors.push(`${prefix} Funding is required, got ${this._market.funding}`)
    } else {
      if (!parseFloat(this._market.funding) > 0) {
        errors.push(`${prefix} Funding is must be greater than 0, got ${this._market.funding}`)
      }
    }

    if (this._market.outcomeType === 'SCALAR') {
      if (!this.required(this._market.unit)) {
        errors.push(`${prefix} Unit is required, got ${this._market.unit}`)
      }
      if (this._market.decimals === undefined ||
        this._market.decimals === null ||
        this._market.decimals < 0) {
        errors.push(`${prefix} Decimals is required and must be >= 0, got ${this._market.decimals}`)
      }
      if (!this.numberRequired(this._market.upperBound)) {
        errors.push(`${prefix} UpperBound is required, got ${this._market.upperBound}`)
      }
      if (!this.numberRequired(this._market.lowerBound)) {
        errors.push(`${prefix} LowerBound is required, got ${this._market.lowerBound}`)
      }
      if (parseInt(this._market.upperBound) <= parseInt(this._market.lowerBound)) {
        errors.push(`${prefix} UpperBound must be greater than LowerBound`)
      }
    } else if (this._market.outcomeType === 'CATEGORICAL') {
      if (!this.arrayRequired(this._market.outcomes, 2)) {
        errors.push(`${prefix} Outcomes is required and must have length 2 at least, got ${this._market.outcomes}`)
      }
    } else {
      errors.push(`${prefix} Market of type ${this._market.outcomeType} not supported`)
    }

    if (errors.length > 0) {
      let stringError = errors.reduce((e, s) => e + '\n' + s, '')
      throw new ValidationError(stringError)
    }
    return true
  }

  /**
  * Custom validators
  */

  validFee (fee) {
    try {
      return (fee !== undefined && fee !== null && parseFloat(fee) >= 0 && parseFloat(fee) <= 10)
    } catch (error) {
      return false
    }
  }
}

module.exports = MarketValidator
