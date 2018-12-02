import Client from './../clients/ethereum'

const getTransactionCost = async (transactionHash, configInstance) => {
  const client = new Client(
    configInstance.credentialType,
    configInstance.accountCredential,
    configInstance.blockchainUrl
  )

  const transactionReceipt = await client.getTransactionReceipt(transactionHash)
  return transactionReceipt.cumulativeGasUsed
}

module.exports = {
  getTransactionCost
}
