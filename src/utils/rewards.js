import axios from 'axios'


const tokenABI = [ { "constant": false, "inputs": [ { "name": "spender", "type": "address" }, { "name": "value", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "to", "type": "address" }, { "name": "value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "owner", "type": "address" }, { "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" } ]

const claimRewards = async configInstance => {
    try {
        if (!configInstance.rewardClaimHandler || !configInstance.rewardClaimHandler.address) {
            throw new Error('rewardClaimHandler is required')
        }

        const rewardInstance = await configInstance.gnosisJS.contracts.RewardClaimHandler.at(configInstance.rewardClaimHandler.address)
        // Get token from the reward contract instance
        const tokenAddress = await rewardInstance.rewardToken()

        // Get scoreboard
        const gnosisDB = configInstance.gnosisDB
        const gnosisDBUrl = `${gnosisDB.protocol}://${gnosisDB.host}:${gnosisDB.port}/api/scoreboard/`
        const scoreboardResult = await axios.get(gnosisDBUrl)
        const filteredScoreboard = scoreboardResult.data.results.slice(0, configInstance.rewardClaimHandler.levels.length)

        // Get rewards
        let winnersAddresses = []
        let rewardAmounts = []
        filteredScoreboard.map((item, index) => {
            winnersAddresses.push(item.account)
            rewardAmounts.push(configInstance.rewardClaimHandler.levels[index]['value'])
        })

        // calculate totalAmount
        const totalAmount = rewardAmounts.reduce((a, b) => a + b)

        // Approve reward token
        const approveTx = await approve(configInstance, tokenAddress, configInstance.rewardClaimHandler.address, totalAmount)

        // function registerRewards(address[] _winners, uint[] _rewardAmounts, uint duration)
        const registerTx = await rewardInstance.registerRewards(winnersAddresses, rewardAmounts, configInstance.rewardClaimHandler.duration)

    } catch (error) {
        
    }
}

const approve = async (configInstance, tokenAddress, rewardClaimAddress, amount) => {
    let result

    if (!tokenAddress) {
        throw new Error(`Provided tokenAddress is invalid, got ${tokenAddress}`)
      }

    if (!rewardClaimAddress) {
      throw new Error(`Provided rewardClaimAddress is invalid, got ${rewardClaimAddress}`)
    }

    if (!amount || amount <= 0) {
      throw new Error(`Cannot approv invalid amounts of Ether, got ${amount} ETH`)
    }

    // Use another web3
    const tokenContract = await configInstance.gnosisJS.web.eth.contract(tokenABI)
    const tokenInstance = await tokenContract.at(tokenAddress)
    result = await tokenInstance.approve(rewardClaimAddress, amount)

    return result
  }

module.exports = {
    claimRewards
}
