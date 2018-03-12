import fs from 'fs'

const hasWriteDirectoryPerms = directory => {
  try {
    fs.accessSync(directory, fs.constants.R_OK | fs.constants.W_OK)
    return true
  } catch (error) {
    return false
  }
}

const fileExists = filePath => {
  try {
    return fs.existsSync(filePath)
  } catch (error) {
    return false
  }
}

const readFile = filePath => {
  const data = fs.readFileSync(filePath, 'utf8')
  // If file is empty, returns an empty object
  if (data === undefined || data === null || data.trim() === '') {
    return {}
  }
  return JSON.parse(data)
}

const writeFile = (filePath, data) => {
  fs.writeFileSync(filePath, data, 'utf8')
}

const removeFile = filePath => {
  fs.unlinkSync(filePath)
}

module.exports = {
  hasWriteDirectoryPerms,
  fileExists,
  readFile,
  writeFile,
  removeFile
}
