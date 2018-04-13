const isPlayMoneyToken = async configInstance => {
  try {
    const playTokenInstance = await configInstance.gnosisJS.contracts.PlayToken.at(configInstance.collateralToken)
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
  return configInstance.gnosisJS.contracts.PlayToken.at(configInstance.collateralToken)
}

module.exports = {
  isPlayMoneyToken,
  getPlayMoneyTokenInstance
}
