import Client from '../src/clients/ethereum'

const accountCredential = process.env.ACCOUNT_CREDENTIAL
const credentialType = process.env.CREDENTIAL_TYPE
const providerUrl = process.env.PROVIDER_URL
const numAccounts = 1

let web3
let snapId

beforeEach(done => {
  const client = new Client(credentialType, accountCredential, numAccounts)
  web3 = client.getWeb3()
  web3.currentProvider.sendAsync({
    jsonrpc: '2.0',
    method: 'evm_snapshot',
    id: 123456
  }, (e, response) => {
    snapId = response.result
    done()
  })
})

afterEach(done => {
  web3.currentProvider.sendAsync({
    jsonrpc: '2.0',
    method: 'evm_revert',
    id: 12345,
    params: [snapId]
  }, () => {
    done()
  })
})
