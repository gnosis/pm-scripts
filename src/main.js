import { main as deploy } from './deploy'
import { main as resolve } from './resolve'

if (process.argv.indexOf('deploy') >= 2) {
  deploy()
} else if (process.argv.indexOf('resolve') >= 2) {
  resolve()
} else {
  deploy()
}
