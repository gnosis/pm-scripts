import FileWriter from '../../src/utils/fileWriter'
import { fileExists, readFile } from '../../src/utils/os'
import { configDir } from '../helpers/generics'
import expect from 'expect.js'

const testData = {
  'address': 'something'
}
const fileName = 'to_be_deleted.json'
const filePath = `${configDir}${fileName}`

describe('File Writer', function () {
  it('Write File', () => {
    const data = Object.assign({}, testData)
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
  it('Update file', () => {
    const data = Object.assign({}, testData)
    const writer = new FileWriter(filePath, data)
    writer.write()
    writer.setData({'city': 'New York', 'address': 'else'})
    writer.write()
    const fileDataUpdatedCheck = readFile(filePath)
    expect(fileDataUpdatedCheck).to.be.an('object')
    expect(fileDataUpdatedCheck.address).to.be('else')
    expect(fileDataUpdatedCheck.city).to.be('New York')
    writer.remove()
    expect(fileExists(filePath)).to.be(false)
  })
  it('Update file without merging', () => {
    const data = Object.assign({}, testData)
    const writer = new FileWriter(filePath, data, false)
    writer.write()
    writer.setData({'city': 'New York', 'address': 'else'})
    writer.write()
    const fileDataUpdatedCheck = readFile(filePath)
    expect(fileDataUpdatedCheck).to.be.an('object')
    expect(fileDataUpdatedCheck.address).to.be(data.ddress)
    expect(fileDataUpdatedCheck.city).to.be(undefined)
    writer.remove()
    expect(fileExists(filePath)).to.be(false)
  })
})
