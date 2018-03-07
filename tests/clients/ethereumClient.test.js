import Client from '../../src/clients/ethereum'
import { testMnemonic } from '../config'
import expect from 'expect.js'

const providerUrl = 'http://localhost:8545'
const numAccounts = 1

describe('Ethereum Client', function () {
  it('Client is setted up', async function () {
    const ethClient = new Client(testMnemonic, providerUrl, numAccounts)
    const accounts = await ethClient.getAccounts()
    expect(accounts.length).to.be(numAccounts)
    const balance = await ethClient.getBalance(accounts[0])
    expect(balance).to.be('100000000000000000000')
  })
})
