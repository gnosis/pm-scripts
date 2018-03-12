
const prefix = '[Gnosis SDK]'
const logError = message => {
  console.error(`${prefix} \x1b[31m${message} \x1b[0m`)
}

const logSuccess = message => {
  console.info(`${prefix} \x1b[32m${message} \x1b[0m`)
}

const logWarn = message => {
  console.warn(`${prefix} \x1b[33m${message} \x1b[0m`)
}

const logInfo = message => {
  console.warn(`${prefix} ${message}`)
}

module.exports = {
  logInfo,
  logError,
  logSuccess,
  logWarn
}
