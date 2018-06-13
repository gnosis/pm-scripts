import { claimRewards } from './utils/rewards'
import { executor } from './utils/execution'

const steps = {
  '-1': [claimRewards],
  '0': [claimRewards]
}


/**
* Rewards claiming wrapper entrypoint
*/
const main = async args => {
  await executor(args, 'claimrewards', steps)
}

module.exports = {
  main
}
