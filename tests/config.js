/*
* MochaJS Global configuration
*/
import prepare from 'mocha-prepare'
import { spawn } from 'child_process'

const testMnemonic = 'gnosis test rpc account ethereum blockchain devops database network software app server'
let cliRPC

prepare(done => {
  // called before loading of test cases
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
}, done => {
  // called after all test completes (regardless of errors)
  cliRPC.kill()
  done()
})

module.exports = {
  testMnemonic
}
