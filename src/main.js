import { main as deploy } from './deploy'
import { main as resolve } from './resolve'
import { main as claimRewards } from './claimrewards'

if (process.argv.indexOf('deploy') >= 2) {
  deploy(process.argv)
} else if (process.argv.indexOf('resolve') >= 2) {
  resolve(process.argv)
} else if (process.argv.indexOf('claimrewards') >= 2) {
  claimRewards(process.argv)
} else {
  deploy(process.argv)
}
