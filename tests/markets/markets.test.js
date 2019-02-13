import ConfigValidator from '../../src/validators/configValidator'
import CentralizedOracleMock from '../helpers/CentralizedOracleMock'
import CategoricalEvent from '../../src/events/categoricalEvent'
import ScalarEvent from '../../src/events/scalarEvent'
import Market from '../../src/markets'
import { categoricalEventDescription, scalarEventDescription, defaultGas } from '../helpers/market'
import { configDir } from '../helpers/generics'
import Token from '../../src/tokens'
import expect from 'expect.js'

describe('Markets', function () {
  this.timeout(60000)
  it('Categorical Market', async () => {
    const validator = new ConfigValidator(configDir + 'valid_config.json')
    await validator.isValid()
    await validator.normalize()
    const config = validator.getConfig()
    // Issue wrap tokens
    config.collateralToken = config.gnosisJS.contracts.WETH9.address
    const token = new Token(config)
    const wrappedTokens = await token.wrapTokens(1e18)
    expect(wrappedTokens).to.be.an('object')
    // Create Oracle
    const oracle = new CentralizedOracleMock(categoricalEventDescription, config)
    await oracle.publishEventDescription()
    await oracle.create()
    const oracleAddress = oracle.getAddress()
    expect(oracleAddress).to.be.a('string')
    expect(oracleAddress.length).to.be(42)
    // Create Event
    const eventInfo = Object.assign(categoricalEventDescription, {oracleAddress}, {gas: defaultGas})
    const event = new CategoricalEvent(eventInfo, config)
    await event.create()
    const eventAddress = event.getAddress()
    expect(eventAddress).to.be.a('string')
    expect(eventAddress.length).to.be(42)
    // Create Market
    let marketInfo = Object.assign(eventInfo, {eventAddress, oracleAddress, fee: '1', funding: '1e18', currency: 'ETH'}, {gas: defaultGas})
    const market = new Market(marketInfo, config)
    await market.create()
    await market.fund()
    const marketAddress = market.getAddress()
    expect(marketAddress).to.be.a('string')
    expect(marketAddress.length).to.be(42)
    marketInfo = Object.assign(market.getData(), {winningOutcome: 1})
    // Check market is not resolved
    let isResolved = await market.isResolved()
    expect(isResolved).to.be(false)
    await market.resolve()
    expect(market.getWinningOutcome()).to.be(1)

    // Verify market is closed
    const marketInstance = await config.gnosisJS.contracts.Market.at(market.getAddress())
    const stage = await marketInstance.stage()
    expect(stage.toNumber()).to.be(2)
    // Check market was resolved
    isResolved = await market.isResolved()
    expect(isResolved).to.be(true)

    // Try again to resolve, should raise an error
    let resolveError = null
    try {
      await market.resolve()
    } catch (error) {
      resolveError = error
    }
    expect(resolveError).not.to.be(null)
  })
  it('Scalar Market', async () => {
    const validator = new ConfigValidator(configDir + 'valid_config.json')
    await validator.isValid()
    await validator.normalize()
    const config = validator.getConfig()
    // Issue wrap tokens
    config.collateralToken = config.gnosisJS.contracts.WETH9.address
    const token = new Token(config)
    const wrappedTokens = await token.wrapTokens(1e18)
    expect(wrappedTokens).to.be.an('object')
    // Create oracle
    const oracle = new CentralizedOracleMock(scalarEventDescription, config)
    await oracle.publishEventDescription()
    await oracle.create()
    const oracleAddress = oracle.getAddress()
    expect(oracleAddress).to.be.a('string')
    expect(oracleAddress.length).to.be(42)
    // Create event
    const eventInfo = Object.assign(scalarEventDescription, {oracleAddress}, {gas: defaultGas})
    const event = new ScalarEvent(eventInfo, config)
    await event.create()
    const eventAddress = event.getAddress()
    expect(eventAddress).to.be.a('string')
    expect(eventAddress.length).to.be(42)
    // Create market
    let marketInfo = Object.assign(eventInfo, {eventAddress, oracleAddress, fee: '1', funding: '1e18', currency: 'ETH', outcomeType: 'SCALAR'}, {gas: defaultGas})
    const market = new Market(marketInfo, config)
    await market.create()
    await market.fund()
    const marketAddress = market.getAddress()
    expect(marketAddress).to.be.a('string')
    expect(marketAddress.length).to.be(42)
    marketInfo = Object.assign(market.getData(), {winningOutcome: 6})
    await market.resolve()
    expect(market.getWinningOutcome()).to.be(6)

    // Verify market is closed
    const marketInstance = await config.gnosisJS.contracts.Market.at(market.getAddress())
    const stage = await marketInstance.stage()
    expect(stage.toNumber()).to.be(2)

    // Try again to resolve, should raise an error
    let resolveError = null
    try {
      await market.resolve()
    } catch (error) {
      resolveError = error
    }
    expect(resolveError).not.to.be(null)
  })
})
