/**
* This scripts handles the resolution process of markets.
+ Once a markets gets resolved cannot accept bets anymore.
*/

import {
  executor, createOracle, createEvent, createMarket, fundMarket, resolveMarket
} from './utils/execution'

const steps = {
  '-1': [createOracle, createEvent, createMarket, fundMarket, resolveMarket],
  '0': [createEvent, createMarket, fundMarket, resolveMarket],
  '1': [createMarket, fundMarket, resolveMarket],
  '2': [resolveMarket],
  '3': [resolveMarket]
}

/**
* Resolution wrapper entrypoint
*/
const main = async args => {
  await executor(args, 'resolve', steps)
}

module.exports = {
  main
}
