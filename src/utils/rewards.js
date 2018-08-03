import axios from 'axios'
import Client from './../clients/ethereum'
import truffleContract from 'truffle-contract'

const claimRewards = async configInstance => {
  try {
    if (!configInstance.rewardClaimHandler || !configInstance.rewardClaimHandler.address) {
      throw new Error('rewardClaimHandler is required')
    }

    // Use another web3
    const providerUrl = `${configInstance.rewardClaimHandler.blockchain.protocol}://${
      configInstance.rewardClaimHandler.blockchain.host
    }:${configInstance.rewardClaimHandler.blockchain.port}`
    const client = new Client(
      configInstance.credentialType,
      configInstance.accountCredential,
      providerUrl
    )

    const rewardClaimHandlerArtifact = require('@gnosis.pm/pm-apollo-contracts/build/contracts/RewardClaimHandler.json')
    const rewardContract = truffleContract(rewardClaimHandlerArtifact)
    rewardContract.setProvider(client.getProvider())
    const rewardInstance = rewardContract.at(configInstance.rewardClaimHandler.address)

    // Get token from the reward contract instance
    const tokenAddress = await rewardInstance.rewardToken()

    // Get scoreboard
    const gnosisDB = configInstance.gnosisDB
    const gnosisDBUrl = `${gnosisDB.protocol}://${gnosisDB.host}:${gnosisDB.port}/api/scoreboard/`
    const scoreboardResult = await axios.get(gnosisDBUrl)
    const filteredScoreboard = scoreboardResult.data.results.slice(
      0,
      configInstance.rewardClaimHandler.levels.length
    )

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
    await approve(
      client.getProvider(),
      configInstance.account,
      tokenAddress,
      configInstance.rewardClaimHandler.address,
      totalAmount
    )

    // function registerRewards(address[] _winners, uint[] _rewardAmounts, uint duration)
    const registerTx = await rewardInstance.registerRewards(
      winnersAddresses,
      rewardAmounts,
      configInstance.rewardClaimHandler.duration,
      { from: configInstance.account, gas: 200000 }
    )

    if (
      (registerTx.receipt && registerTx.receipt.status == '0x0') ||
      (registerTx.receipt && registerTx.receipt.status == 0)
    ) {
      throw new Error('Reward Claim transaction failed')
    }

    return registerTx
  } catch (error) {
    throw error
  }
}

const approve = async (provider, sender, tokenAddress, rewardClaimAddress, amount) => {
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

  try {
    const tokenArtifact = require('@gnosis.pm/pm-apollo-contracts/build/contracts/Token.json')
    const tokenContract = truffleContract(tokenArtifact)
    tokenContract.setProvider(provider)
    const tokenInstance = tokenContract.at(tokenAddress)

    // Do tokens transfer approval
    result = await tokenInstance.approve(rewardClaimAddress, amount, { from: sender })

    if (
      (result.receipt && result.receipt.status == '0x0') ||
      (result.receipt && result.receipt.status == 0)
    ) {
      throw new Error('Approve token transaction failed')
    }

    return result
  } catch (err) {
    throw err
  }
}

module.exports = {
  claimRewards
}
