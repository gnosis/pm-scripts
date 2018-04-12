const isPlayMoneyToken = async configInstance => {
  try {
    const playTokenInstance = configInstance.gnosisJS.contracts.PlatToken.at(configInstance.collateralToken)
    if (playTokenInstance.isPlayToken && await playTokenInstance.isPlayToken() === true) {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

const getPlayMoneyTokenInstance = configInstance => {
  return configInstance.gnosisJS.contracts.PlatToken.at(configInstance.collateralToken)
}

module.exports = {
  isPlayMoneyToken,
  getPlayMoneyTokenInstance
}
