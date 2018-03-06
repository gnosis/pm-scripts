import Client from '../../src/clients/ethereum'
import expect from 'expect.js'
import { spawn } from 'child_process'

const testMnemonic = 'gnosis test rpc account ethereum blockchain loan fruit valid theme emerge invite'
const providerUrl = 'http://localhost:8545'
const numAccounts = 1
let cliRPC

describe('Ethereum Client', function () {
  this.timeout(10000)

  before(done => {
    console.log('Starting ganache-cli...')
    cliRPC = spawn('./node_modules/ganache-cli/build/cli.node.js', ['--mnemonic', testMnemonic])
    cliRPC.stdout.on('data', data => {
      console.log(`stdout: ${data}`)
    })

    cliRPC.stderr.on('data', data => {
      console.log(`stderr: ${data}`)
    })

    cliRPC.on('close', code => {
      console.log(`Ganache-cli child process exited with code ${code}`)
    })
    // wait for rpc client to get up and running
    setTimeout(done, 3500)
  })

  after(() => {
    cliRPC.kill()
  })

  it('Client is setted up', async function () {
    const ethClient = new Client(testMnemonic, providerUrl, numAccounts)
    const accounts = await ethClient.getAccounts()
    expect(accounts.length).to.be(numAccounts)
    const balance = await ethClient.getBalance(accounts[0])
    expect(balance).to.be('100000000000000000000')
  })
})
