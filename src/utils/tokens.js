const isPlayMoneyToken = async configInstance => {
  try {
    const web3 = configInstance.blockchainProvider.getWeb3()
    const contractCode = web3.eth.getCode(configInstance.collateralToken)
    if (!contractCode || contractCode.replace("0x", "").replace(/0/g, "") === '') {
      // doesn't exist
      return false
    }
    
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
