import FileWriter from '../../src/utils/fileWriter'
import { fileExists, readFile } from '../../src/utils/os'
import { configDir } from '../helpers/generics'
import expect from 'expect.js'

describe('File Writer', function () {
  it('Write File', function () {
    const data = {
      'address': 'something'
    }
    const fileName = 'to_be_deleted.json'
    const filePath = `${configDir}${fileName}`
    expect(fileExists(filePath)).to.be(false)
    const writer = new FileWriter(filePath, data)
    writer.write()
    expect(fileExists(filePath)).to.be(true)
    const fileDataCheck = readFile(filePath)
    expect(fileDataCheck).to.be.an('object')
    expect(fileDataCheck.address).to.be(data.address)
    writer.remove()
    expect(fileExists(filePath)).to.be(false)
  })
})
