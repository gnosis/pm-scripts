import expect from 'expect.js'
import path from 'path'

const configDir = path.join(__dirname, '../../tests/config/')

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
