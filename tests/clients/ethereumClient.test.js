import Client from '../../src/clients/ethereum'
import expect from 'expect.js'

const testMnemonic = process.env.MNEMONIC
const providerUrl = process.env.PROVIDER_URL
const numAccounts = 1

describe('Ethereum Client', function () {
  it('Client is setted up', async function () {
    const ethClient = new Client(testMnemonic, providerUrl, numAccounts)
    const accounts = await ethClient.getAccounts()
    expect(accounts.length).to.be(numAccounts)
    const balance = await ethClient.getBalance(accounts[0])
    expect(balance).to.be.greaterThan(0)
  })
})
