/**
* This scripts handles the deployment process of new markets.
+ Provides also the market with funds.
*/

import {
  executor, createOracle, createEvent, createMarket, fundMarket
} from './utils/execution'

const steps = {
  '-1': [createOracle, createEvent, createMarket, fundMarket],
  '0': [createEvent, createMarket, fundMarket],
  '1': [createMarket, fundMarket],
  '2': [fundMarket],
  '3': [] // market resolution not handled on this script, see resolve.js
}

/**
* Deploy wrapper entrypoint
*/
const main = async args => {
  await executor(args, 'deploy', steps)
}

module.exports = {
  main
}
