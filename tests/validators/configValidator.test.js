import ConfigValidator from '../../src/validators/configValidator'
import expect from 'expect.js'

describe('Config Validator', function () {
  this.timeout(10000)
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
  // Breaks MochaJS testcase due to process.exit
  // it('OS permissions', function () {
  //   const validator = new ConfigValidator('tests/validators/valid_config.json')
  //   expect(validator.hasWritePermissions).withArgs(__dirname).not.to.throwException()
  //   expect(validator.hasWritePermissions).withArgs('/root').to.throwException()
  // })
  it('Validate URL Regex', () => {
    const testRegex = value => {
      const webUrlRegex = '(https?):\/\/?[^\s(["<,>]*\.[^\s[",><]*:[0-9]*'
      const regexResult = value.match(webUrlRegex)
      return (regexResult !== null && regexResult.length > 0)
    }

    const url1 = 'http://'
    const url2 = 'https://'
    const url3 = 'http://localhost'
    const url4 = 'http://localhost:8545'
    const url5 = 'http://8545'
    const url6 = 'http://127.0.0.1'
    const url7 = 'https://127.0.0.1'
    const url8 = 'http://127.0.0.1:8545'
    const url9 = 'https://127.0.0.1:8545'

    expect(testRegex(url1)).to.be(false)
    expect(testRegex(url2)).to.be(false)
    expect(testRegex(url3)).to.be(false)
    expect(testRegex(url4)).to.be(true)
    expect(testRegex(url5)).to.be(false)
    expect(testRegex(url6)).to.be(false)
    expect(testRegex(url7)).to.be(false)
    expect(testRegex(url8)).to.be(true)
    expect(testRegex(url9)).to.be(true)
  })
  it('Configuration normalization works', async () => {
    const validator = new ConfigValidator('tests/validators/valid_config.json')
    validator.load()
    const config = validator.getConfig()
    const normConfig = await validator.normalize()
    expect(normConfig.blockchainUrl).not.to.be(undefined)
    expect(normConfig.collateralToken).to.be(config.collateralToken.toLowerCase())
    expect(normConfig.gnosisJS).to.be.an('object')
    expect(normConfig.blockchain).to.be.an('object')
    expect(normConfig.blockchainProvider).to.be.an('object')
    expect(normConfig.gnosisDB).to.be.an('object')
    expect(normConfig.gnosisDBUrl).not.to.be(undefined)
    expect(normConfig.ipfs).to.be.an('object')
    expect(normConfig.ipfsUrl).not.to.be(undefined)
  })
})
