// TODO
// rename OlympiaToken to PlayToken
const isPlayMoneyToken = async configInstance => {
    try {
        const playTokenIstance = configInstance.gnosisJS.contracts.OlympiaToken.at(configInstance.collateralToken)
        if (playTokenIstance.isPlayToken && await playTokenIstance.isPlayToken() == true) {
            return true
        } else {
            return false
        }
    } catch(error) {
        return false
    }

}

const getPlayMoneyTokenInstance = configInstance => {
    return configInstance.gnosisJS.contracts.OlympiaToken.at(configInstance.collateralToken)
}

module.exports = {
    isPlayMoneyToken,
    getPlayMoneyTokenInstance
}