import BaseValidator from '../../src/validators/baseValidator'
import expect from 'expect.js'

const baseValidator = new BaseValidator()

describe('Config Validator', function () {
  it('Test required', function () {
    expect(baseValidator.required(null)).to.be(false)
    expect(baseValidator.required(undefined)).to.be(false)
    expect(baseValidator.required('')).to.be(false)
    expect(baseValidator.required('something')).to.be(true)
  })
  it('Test required eth address', function () {
    expect(baseValidator.requiredEthAddress(undefined)).to.be(false)
    expect(baseValidator.requiredEthAddress('0x123456789b123456789')).to.be(false)
    expect(baseValidator.requiredEthAddress('0x123456789b123456789b123456789b1234567890')).to.be(true)
  })
  it('Test object validation', function () {
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
})
