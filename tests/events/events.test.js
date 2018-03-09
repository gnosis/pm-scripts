import ConfigValidator from '../../src/validators/configValidator'
import CentralizedOracle from '../../src/oracles/centralizedOracle'
import CategoricalEvent from '../../src/events/categoricalEvent'
import ScalarEvent from '../../src/events/scalarEvent'
import { categoricalEventDescription, scalarEventDescription } from '../helpers/market'
import { configDir } from '../helpers/generics'
import expect from 'expect.js'

describe('Events', function () {
  this.timeout(10000)

  it('Categorical Event', async () => {
    const validator = new ConfigValidator(configDir + 'valid_config.json')
    await validator.isValid()
    await validator.normalize()
    const config = validator.getConfig()
    const oracle = new CentralizedOracle(categoricalEventDescription, config)
    await oracle.create()
    const oracleAddress = oracle.getAddress()
    expect(oracleAddress).to.be.a('string')
    expect(oracleAddress.length).to.be(42)
    const eventInfo = Object.assign(categoricalEventDescription, {oracleAddress})
    const event = new CategoricalEvent(eventInfo, config)
    await event.create()
    const eventAddress = event.getAddress()
    expect(eventAddress).to.be.a('string')
    expect(eventAddress.length).to.be(42)
  })

  it('Scalar Event', async () => {
    const validator = new ConfigValidator(configDir + 'valid_config.json')
    await validator.isValid()
    await validator.normalize()
    const config = validator.getConfig()
    const oracle = new CentralizedOracle(scalarEventDescription, config)
    await oracle.create()
    const oracleAddress = oracle.getAddress()
    expect(oracleAddress).to.be.a('string')
    expect(oracleAddress.length).to.be(42)
    const eventInfo = Object.assign(scalarEventDescription, {oracleAddress})
    const event = new ScalarEvent(eventInfo, config)
    await event.create()
    const eventAddress = event.getAddress()
    expect(eventAddress).to.be.a('string')
    expect(eventAddress.length).to.be(42)
  })
})
