/**
* This scripts handles the deployment process of new markets.
+ Provides also the market with funds.
*/
import executor from './executor'
import { EXECUTION_TYPES } from './utils/constants'


/**
* Deploy wrapper entrypoint
*/
const main = async args => {
  await executor(args, EXECUTION_TYPES.deploy)
}

module.exports = {
  main
}
