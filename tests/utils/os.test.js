import { hasWriteDirectoryPerms } from '../../src/utils/os'
import expect from 'expect.js'

describe('OS Utils', function () {
  it('Has write permissions', function () {
    const hasPerms = hasWriteDirectoryPerms(__dirname)
    expect(hasPerms).to.be(true)
  })
  it('Hasn\'t write permissions', function () {
    const hasPerms = hasWriteDirectoryPerms('/root')
    expect(hasPerms).to.be(false)
  })
})
