/**
* This scripts handles the resolution process of markets.
+ Once a markets gets resolved cannot accept bets anymore.
*/
import executor from './executor'
import { EXECUTION_TYPES } from './utils/constants'


/**
* Resolution wrapper entrypoint
*/
const main = async args => {
  await executor(args, EXECUTION_TYPES.resolve)
}

module.exports = {
  main
}
