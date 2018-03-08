import expect from 'expect.js'

const configDir = 'tests/config/'
const getExpectJS = () => {
  expect.throwsAsync = async (fn, params) => {
    try {
      await fn(params)
      return false
    } catch (error) {
      return true
    }
  }
  return expect
}

module.exports = {
  configDir,
  getExpectJS
}
