import Client from '../../src/clients/ethereum'
import expect from 'expect.js'

const testMnemonic = process.env.MNEMONIC
const testPrivateKey = process.env.PRIVATE_KEY

const providerUrl = process.env.PROVIDER_URL
const numAccounts = 1

describe('Ethereum Client', function () {
  it('Client is set up using mnemonic', async function () {
    const ethClient = new Client(testMnemonic, providerUrl, numAccounts)
    const accounts = await ethClient.getAccounts()
    expect(accounts.length).to.be(numAccounts)
    const balance = await ethClient.getBalance(accounts[0])
    expect(balance).to.be.greaterThan(0)
  })

  it('Client is set up using private key', async function () {
    const ethClient = new Client(testPrivateKey, providerUrl)
    const accounts = await ethClient.getAccounts()
    expect(accounts.length).to.be(1)
  })
})
