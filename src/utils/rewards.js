import axios from 'axios'
import truffleContract from 'truffle-contract'
import { BigNumber } from 'bignumber.js/bignumber.js';
import Client from './../clients/ethereum'
import rewardClaimHandlerArtifact from '@gnosis.pm/pm-apollo-contracts/build/contracts/RewardClaimHandler.json'
import tokenArtifact from '@gnosis.pm/pm-apollo-contracts/build/contracts/Token.json'


const claimRewards = async (marketDescription, configInstance) => {
  try {
    if (!configInstance.rewardClaimHandler || !configInstance.rewardClaimHandler.address) {
      throw new Error('rewardClaimHandler is required')
    }

    const {
      rewardClaimHandler: rewardClaimConfig,
      'pm-trading-db': tradingDB,
      credentialType,
      accountCredential,
      account,
      gasPrice,
      decimals = 18
    } = configInstance

    // Use another web3
    const providerUrl = `${rewardClaimConfig.blockchain.protocol}://${
      rewardClaimConfig.blockchain.host
    }:${rewardClaimConfig.blockchain.port}`
    const client = new Client(credentialType, accountCredential, providerUrl)

    const rewardContract = truffleContract(rewardClaimHandlerArtifact)
    rewardContract.setProvider(client.getProvider())
    const rewardInstance = rewardContract.at(rewardClaimConfig.address)

    // Get token from the reward contract instance
    const tokenAddress = await rewardInstance.rewardToken()

    // Get scoreboard
    const tradingDBUrl = `${tradingDB.protocol}://${tradingDB.host}:${tradingDB.port}/api/scoreboard/`

    const scoreboardResult = await axios.get(tradingDBUrl)

    const lastRewardedRank =
      rewardClaimConfig.levels[rewardClaimConfig.levels.length - 1].maxRank - 1
    const filteredScoreboard = scoreboardResult.data.results.slice(0, lastRewardedRank)

    // Get rewards
    let winnersAddresses = []
    let rewardAmounts = []
    filteredScoreboard.map((item, index) => {
      winnersAddresses.push(item.account)
      rewardAmounts.push(
        rewardClaimConfig.levels.find(({ minRank, maxRank }) => {
          const scoreboardPosition = index + 1
          return scoreboardPosition >= minRank && scoreboardPosition <= maxRank
        }).value
      )
    })

    const rewardAmountsWei = rewardAmounts.map(rewardAmount =>
      new BigNumber(rewardAmount).times(new BigNumber(10).pow(decimals)).toString()
    )

    // calculate totalAmount
    const totalAmount = rewardAmounts.reduce((a, b) => a + b)

    // Approve reward token
    await approve(
      client.getProvider(),
      account,
      tokenAddress,
      rewardClaimConfig.address,
      new BigNumber(totalAmount).times(new BigNumber(10).pow(decimals)).toString()
    )

    // function registerRewards(address[] _winners, uint[] _rewardAmounts, uint duration)
    const registerTx = await rewardInstance.registerRewards(
      winnersAddresses,
      rewardAmountsWei,
      rewardClaimConfig.duration,
      { from: account, gas: 5000000, gasPrice }
    )

    if (
      (registerTx.receipt && registerTx.receipt.status === '0x0') ||
      (registerTx.receipt && registerTx.receipt.status === 0)
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
    const tokenContract = truffleContract(tokenArtifact)
    tokenContract.setProvider(provider)
    const tokenInstance = tokenContract.at(tokenAddress)

    // Do tokens transfer approval
    result = await tokenInstance.approve(rewardClaimAddress, amount, { from: sender })

    if (
      (result.receipt && result.receipt.status === '0x0') ||
      (result.receipt && result.receipt.status === 0)
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
