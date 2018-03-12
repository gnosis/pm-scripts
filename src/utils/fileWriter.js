import { fileExists, readFile, writeFile, removeFile } from './os'

class FileWriter {
  constructor (filePath, data, include = true) {
    this._filePath = filePath
    this._data = data
    this._include = include
  }

  setData (data) {
    this._data = data
  }

  setFilePath (filePath) {
    this._filePath = filePath
  }

  /**
  * Writes JSON data to a file.
  * Can merge current `this._data` with file content if `this._include` is true
  * @throws Error
  */
  write () {
    let data = {}

    if (fileExists(this._filePath) && this._include) {
      // read file content
      data = readFile(this._filePath)
    }

    if (this._include) {
      // include data
      data = Object.assign(data, this._data)
    } else {
      data = this._data
    }
    // write
    writeFile(this._filePath, JSON.stringify(data, null, 2))
  }

  /**
  * Removes the current `this._filePath` file from disk
  */
  remove () {
    removeFile(this._filePath)
  }
}

module.exports = FileWriter
