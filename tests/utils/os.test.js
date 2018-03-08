import { hasWriteDirectoryPerms, fileExists, readFile } from '../../src/utils/os'
import { configDir } from '../helpers/generics'
import expect from 'expect.js'

describe('OS Utils', function () {
  it('Has write permissions', () => {
    const hasPerms = hasWriteDirectoryPerms(__dirname)
    expect(hasPerms).to.be(true)
  })
  it('Hasn\'t write permissions', () => {
    const hasPerms = hasWriteDirectoryPerms('/root')
    expect(hasPerms).to.be(false)
  })
  it('File Exists', () => {
    expect(fileExists(configDir + 'valid_config.json')).to.be(true)
  })
  it('File does not exist', () => {
    expect(fileExists(configDir + 'not_existing_file.json')).to.be(false)
  })
  it('Read file', () => {
    expect(readFile(configDir + 'valid_config.json')).to.not.be(null)
    expect(readFile).withArgs(configDir + 'not_existing_file.json').to.throwException()
  })
})
