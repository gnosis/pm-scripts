import ConfigValidator from '../../src/validators/configValidator'
import expect from 'expect.js'

describe('Config Validator', function () {
  describe('#File path', function () {
    it('Should raise file not found', function () {
      expect(new ConfigValidator('not_existing_config.json').load).to.throwException()
    })
    it('Configuration is not valid', function () {
      const validator = new ConfigValidator('tests/validators/invalid_config.json')
      validator.load()
      expect(validator.getConfig()).not.to.be(null)
      expect(validator.isValid).to.throwException()
    })
    it('Configuration collateral token is not valid', function () {
      const validator = new ConfigValidator('tests/validators/invalid_collateral_token_config.json')
      expect(validator.isValid).to.throwException()
    })
    it('Configuration is valid', function () {
      const validator = new ConfigValidator('tests/validators/valid_config.json')
      expect(validator.isValid()).to.be(true)
    })
  })
})
