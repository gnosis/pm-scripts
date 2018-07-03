import BaseValidator from '../../src/validators/baseValidator'
import expect from 'expect.js'

const baseValidator = new BaseValidator()

describe('Config Validator', () => {
  it('Test required', function () {
    expect(baseValidator.required(null)).to.be(false)
    expect(baseValidator.required(undefined)).to.be(false)
    expect(baseValidator.required('')).to.be(false)
    expect(baseValidator.required('something')).to.be(true)
  })
  it('Test required eth address', () => {
    expect(baseValidator.requiredEthAddress(undefined)).to.be(false)
    expect(baseValidator.requiredEthAddress('0x123456789b123456789')).to.be(false)
    expect(baseValidator.requiredEthAddress('0x123456789b123456789b123456789b1234567890')).to.be(true)
  })
  it('Test object validation', () => {
    const requiredParams = ['protocol', 'host', 'port']
    const httpInvalidObject = {
      'protocol': '',
      'host': '',
      'port': ''
    }
    const httpValidObject = {
      'protocol': 'http',
      'host': 'something.io',
      'port': '8080'
    }
    expect(baseValidator.objectPropertiesRequired(undefined, requiredParams)).to.be(false)
    expect(baseValidator.objectPropertiesRequired(httpInvalidObject)).to.be(true)
    expect(baseValidator.objectPropertiesRequired(httpInvalidObject, [])).to.be(true)
    expect(baseValidator.objectPropertiesRequired(httpInvalidObject, requiredParams)).to.be(false)
    httpInvalidObject['host'] = 'something.io'
    expect(baseValidator.objectPropertiesRequired(httpInvalidObject, requiredParams)).to.be(false)
    expect(baseValidator.objectPropertiesRequired(httpValidObject, requiredParams)).to.be(true)
  })
  it('Test date validation', () => {
    let invalidDate = '2018-12-31t12:00:00.000z'
    expect(baseValidator.validDate(invalidDate)).to.be(false)
    let validDate = '2018-10-30T00:00:00'
    expect(baseValidator.validDate(validDate)).to.be(true)
    validDate = '2018-12-31T18:00:00.000Z'
    expect(baseValidator.validDate(validDate)).to.be(true)
    validDate = '2018-10-30'
    expect(baseValidator.validDate(validDate)).to.be(true)
  })
})
