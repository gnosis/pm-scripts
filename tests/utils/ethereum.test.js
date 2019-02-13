import ConfigValidator from '../../src/validators/configValidator'
import CentralizedOracle from '../../src/oracles/centralizedOracle'
import CategoricalEvent from '../../src/events/categoricalEvent'
import ScalarEvent from '../../src/events/scalarEvent'
import Market from '../../src/markets'
import { categoricalEventDescription, scalarEventDescription, defaultGas } from '../helpers/market'
import { getTransactionCost } from '../../src/utils/ethereum'
import { configDir } from '../helpers/generics'
import expect from 'expect.js'

describe('Ethereum Utils', function () {
  this.timeout(60000)
  it('Calculate transaction costs', async () => {
    let transactionHash

    const validator = new ConfigValidator(configDir + 'valid_config.json')
    await validator.isValid()
    await validator.normalize()
    const config = validator.getConfig()
    const oracle = new CentralizedOracle(categoricalEventDescription, config)
    await oracle.publishEventDescription()
    await oracle.create()
    const oracleAddress = oracle.getAddress()
    transactionHash = oracle.getTransactionHash()
    const oracleCost = await getTransactionCost(transactionHash, config)
    expect(oracleCost).to.be.above(0)

    const eventInfo = Object.assign(categoricalEventDescription, { oracleAddress })
    const event = new CategoricalEvent(eventInfo, config)
    await event.create()
    const eventAddress = event.getAddress()

    transactionHash = event.getTransactionHash()
    const eventCost = await getTransactionCost(transactionHash, config)
    expect(eventCost).to.be.above(0)

    let marketInfo = Object.assign(eventInfo, { eventAddress, oracleAddress, fee: '1', funding: '1e18', currency: 'ETH' }, { gas: defaultGas })
    const market = new Market(marketInfo, config)
    await market.create()

    transactionHash = market.getTransactionHash()
    const marketCost = await getTransactionCost(transactionHash, config)
    expect(marketCost).to.be.above(0)

  })
})
