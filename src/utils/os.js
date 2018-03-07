import fs from 'fs'

const hasWriteDirectoryPerms = directory => {
  try {
    fs.accessSync(directory, fs.constants.R_OK | fs.constants.W_OK)
    return true
  } catch (error) {
    return false
  }
}

module.exports = {
  hasWriteDirectoryPerms
}
