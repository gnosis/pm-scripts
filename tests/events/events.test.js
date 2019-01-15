import ConfigValidator from '../../src/validators/configValidator'
import CentralizedOracle from '../../src/oracles/centralizedOracle'
import CategoricalEvent from '../../src/events/categoricalEvent'
import ScalarEvent from '../../src/events/scalarEvent'
import { categoricalEventDescription, scalarEventDescription, defaultGas } from '../helpers/market'
import { configDir } from '../helpers/generics'
import expect from 'expect.js'

describe('Events', function () {
  this.timeout(60000)

  it('Categorical Event', async () => {
    const validator = new ConfigValidator(configDir + 'valid_config.json')
    await validator.isValid()
    await validator.normalize()
    const config = validator.getConfig()
    // Create oracle
    const oracle = new CentralizedOracle(categoricalEventDescription, config)
    await oracle.publishEventDescription()
    await oracle.create()
    const oracleAddress = oracle.getAddress()
    expect(oracleAddress).to.be.a('string')
    expect(oracleAddress.length).to.be(42)
    // Create event
    const eventInfo = Object.assign(categoricalEventDescription, {oracleAddress})
    const event = new CategoricalEvent(eventInfo, config)
    await event.create()
    const eventAddress = event.getAddress()
    expect(eventAddress).to.be.a('string')
    expect(eventAddress.length).to.be(42)
    expect(await event.isResolved()).to.be(false)
  }),
  it('Huge categorical Event', async () => {
    const validator = new ConfigValidator(configDir + 'valid_config.json')
    await validator.isValid()
    await validator.normalize()
    const config = validator.getConfig()
    // Create event with 6 outcomes
    categoricalEventDescription.outcomes = ['1', '2', '3', '4', '5', '6']
    const oracle = new CentralizedOracle(categoricalEventDescription, config)
    await oracle.publishEventDescription()
    await oracle.create()
    const oracleAddress = oracle.getAddress()
    // Create event
    const eventInfo = Object.assign(categoricalEventDescription, {oracleAddress})
    const event = new CategoricalEvent(eventInfo, config)
    await event.create()
    const eventAddress = event.getAddress()
    expect(eventAddress).to.be.a('string')
    expect(eventAddress.length).to.be(42)
    expect(await event.isResolved()).to.be(false)
  }),
  it('Scalar Event', async () => {
    const validator = new ConfigValidator(configDir + 'valid_config.json')
    await validator.isValid()
    await validator.normalize()
    const config = validator.getConfig()
    // Create oracle
    const oracle = new CentralizedOracle(scalarEventDescription, config)
    await oracle.publishEventDescription()
    await oracle.create()
    const oracleAddress = oracle.getAddress()
    expect(oracleAddress).to.be.a('string')
    expect(oracleAddress.length).to.be(42)
    // Create event
    const eventInfo = Object.assign(scalarEventDescription, {oracleAddress}, { gas: defaultGas })
    const event = new ScalarEvent(eventInfo, config)
    await event.create()
    const eventAddress = event.getAddress()
    expect(eventAddress).to.be.a('string')
    expect(eventAddress.length).to.be(42)
    expect(await event.isResolved()).to.be(false)
  })
})
