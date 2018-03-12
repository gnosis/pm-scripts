
const logError = message => {
  console.error(`\x1b[31m${message} \x1b[0m`)
}

const logSuccess = message => {
  console.info(`\x1b[32m${message} \x1b[0m`)
}

const logWarn = message => {
  console.warn(`\x1b[33m${message} \x1b[0m`)
}

module.exports = {
  logError,
  logSuccess,
  logWarn
}
