import ConfigValidator from '../../src/validators/configValidator'
import CentralizedOracleMock from '../helpers/CentralizedOracleMock'
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
    const oracle = new CentralizedOracleMock(categoricalEventDescription, config)
    await oracle.publishEventDescription()
    await oracle.create()
    const oracleAddress = oracle.getAddress()
    const transactionHash = oracle.getTransactionHash()
    const ipfsHash = oracle.getIpfsHash()
    expect(ipfsHash).not.to.be(null)
    expect(ipfsHash).to.be.a('string')
    expect(oracleAddress).not.to.be(null)
    expect(oracleAddress).not.to.be(undefined)
    expect(oracleAddress).to.be.a('string')
    expect(oracleAddress.length).to.be(42)
    expect(transactionHash).to.be.a('string')
    expect(await oracle.isResolved()).to.be(false)
  })
})
