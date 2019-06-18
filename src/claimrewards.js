import executor from './executor'
import { EXECUTION_TYPES } from './utils/constants'


/**
* Rewards claiming wrapper entrypoint
*/
const main = async args => {
  await executor(args, EXECUTION_TYPES.claimRewards) 
}

module.exports = {
  main
}
