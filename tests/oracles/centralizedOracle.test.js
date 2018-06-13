import ConfigValidator from '../../src/validators/configValidator'
import CentralizedOracle from '../../src/oracles/centralizedOracle'
import { categoricalEventDescription } from '../helpers/market'
import { configDir } from '../helpers/generics'
import expect from 'expect.js'

describe('CentralizedOracle', function () {
  this.timeout(60000)
  it('Centralized Oracle Creation', async () => {
    const validator = new ConfigValidator(configDir + 'valid_config.json')
    await validator.isValid()
    await validator.normalize()
    const config = validator.getConfig()
    const oracle = new CentralizedOracle(categoricalEventDescription, config)
    await oracle.create()
    const oracleAddress = oracle.getAddress()
    expect(oracleAddress).not.to.be(null)
    expect(oracleAddress).not.to.be(undefined)
    expect(oracleAddress).to.be.a('string')
    expect(oracleAddress.length).to.be(42)
  })
})
