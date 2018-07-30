# pm-scripts

pm-scripts is a command line tool which allows users to create and resolve prediction markets on top of Gnosis.

## Index of contents

- [Installation](#installation)
- [Compiling the library](#compilation)
- [Supported chains](#supported-chains)
- [Configuration](#configuration)
- [Tournament operators](#tournament-operators)
- [Getting help](#getting-help)
- [Resolving markets](#resolving-markets)
- [Fetch markets data](#fetch-markets-data-pm-trading-db-api)
- [Using custom oracles](#using-custom-oracles)
- [Claim Rewards](#claim-rewards)
- [License](#license)

## Installation

pm-scripts should work for any OS. It has the following system requirements:

* Node.js (versions >= 7 should work)
* NPM (should be installed with Node.js, and versions >= 5 should work)

To install all the required software dependencies clone the project, go to the root folder and run:

```npm install```

## Compilation

There are two ways to use the library: by using pre-defined npm scripts (deploy, resolve) or executing lib/main.js with node.js and passing the arguments. If you use first way, the library will be compiled before script execution, but if you prefer the second way, you would have to compile the library:

Using predefined npm script:

```npm run build```

Using babel:

```./node_modules/.bin/babel src -d lib```

## Supported chains
pm-scripts can work with either Mainnet, Rinkeby, Kovan or Ropsten networks.
[pm-trading-db](https://github.com/gnosis/pm-trading-db/) currently supports only Mainnet and Rinkeby networks.
In order to deploy contract on Kovan or Ropsten you would need to install an instance of
[pm-trading-db](https://github.com/gnosis/pm-trading-db/) with the specific Ethereum node settings.
We encourage users to **use the Rinkeby network**.

## Configuration
The *conf* directory contains all the configuration files needed by pm-scripts, which are: **config.json** and **markets.json**.
Besides that files, you can always specify any configuration file by providing its path as a parameter to pm-scripts as described in [How to run pm-scripts](#how-to-run-pm-scripts) paragraph.

### conf/config.json
Contains the main pm-scripts configuration and has the following structure:

```
{
  "accountCredential": "(REQUIRED) YOUR MNEMONIC PHRASE OR PRIVATE KEY",
  "credentialType": "(REQUIRED) "mnemonic" or "privateKey"",
  "account": "YOUR ACCOUNT ADDRESS",
  "blockchain": {
    "protocol": "https",
    "host": "rinkeby.infura.io/gnosis/",
    "port": "443"
  },
  "pm-trading-db": {
    "protocol": "https",
    "host": "pm-trading-db.staging.gnosisdev.com",
    "port": "443"
  },
  "ipfs": {
    "protocol": "https",
    "host": "ipfs.infura.io",
    "port": "5001"
  },
  "gasPrice": "1000000000",
  "collateralToken": "0xd19bce9f7693598a9fa1f94c548b20887a33f141"
}
```

* **accountCredential**, This is your wallet credential. Can be either HD wallet mnemonic phrase composed by 12 words ([HD wallet repository](https://github.com/trufflesuite/truffle-hdwallet-provider)) or private key ([HD wallet private key repository](https://github.com/rhlsthrm/truffle-hdwallet-provider-privkey));
* **credentialType**, is a type of credential you want to use to access your account, available values: `mnemonic`, `privateKey`, default is `privateKey`;
* **account**, is your ethereum address, all transactions will be sent from this address. If not provided, pm-scripts will calculate it from your mnemonic phrase;
* **blockchain**, defines the Ethereum Node pm-scripts should send transactions to (https://rinkeby.infura.io/gnosis/ by default);
* **pm-trading-db**, defines the [pm-trading-db](https://github.com/gnosis/pm-trading-db/) url, an Ethereum indexer which exposes a handy API to get your list of markets and their details (default: https://pm-trading-db.rinkeby.gnosis.pm:443);
* **ipfs**, sets the IPFS node pm-scripts should send transactions to (https://ipfs.infura.io:5001 by default);
* **gasPrice**, the desired gasPrice
* **collateralToken**, the Collateral Token contract's address:
  - **Rinkeby:** 0xd19bce9f7693598a9fa1f94c548b20887a33f141
  - **Kovan:** 0x9326454039077bcea0705d6b68c8e9b104094a1c

### conf/market.json
Contains a JSON array and defines all the markets you want to create and manage.

#### Market properties
In order to create markets on top of Gnosis each market in the configuration file must provide the following properties, as also exemplified in the **examples** directory:

##### Title
The title of the market.

##### Description
A text field describing the title of the market.

##### resolutionDate
Defines when the prediction market ends, you can always resolve a market before its resolutionDate expires.
Format must be any recognised by
[Javascript Date constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date),
it's recommended to use an ISO date format like *2018-03-27T16:20:11.698Z*.

##### currency
A text field defining which currency is holding the market's funds.

##### fee
A text field defining the amount of fee held by the market creator. More info on the dedicated [pm-js documentation](https://pm-js.readthedocs.io/en/latest/events-oracles-and-markets.html#markets-and-automated-market-makers).

##### funding
A text field representing how much funds to provid the market with.

##### winningOutcome
A text field representing the winning outcome. If declared, pm-scripts  will try to resolve the market, but will always ask you to confirm before proceeding.

##### outcomeType
Defines the prediction market type. You must strictly provide 'CATEGORICAL' or 'SCALAR' (categorical market
or scalar market).

##### upperBound (scalar markets)
A text field representing the upper bound of the predictions range. More info on [pm-js documentation](https://pm-js.readthedocs.io/en/latest/events-oracles-and-markets.html#events-with-scalar-outcomes).

##### lowerBound (scalar markets)
A text field representing the lower bound of the predictions range.

##### decimals (scalar markets)
Values are passed in as whole integers and adjusted to the right order of magnitude according to the decimals property of the event description, which is a numeric integer.

##### unit (scalar markets)
A text field representing the market's unit of measure, like '%' or '°C' etc...

##### outcomes (categorical markets)
An array of text fields representing the available outcomes for the market.


### How to run pm-scripts
Before getting started **make sure you hold enough balance on your account** or transactions could fail.

The main pm-scripts entry point is the lib/main.js file.
The two main options are **deploy** and **resolve**:

```
node lib/main.js deploy
node lib/main.js resolve
```

After you deploy *markets.json* will be updated with the addresses deployed and the ipfsHashes.

You can also supply a custom pm-scripts configuration file and markets' file by providing the *-f* and *-m* parameters
followed by the full absolute path to your files:

`node lib/main.js deploy -f path/to/pm-scripts/config -m path/to/markets/file`

In order to fund markets you may want to wrap Ethers to Collateral Tokens.
Just provide the *-w* parameter followed by the amount of tokens you want to wrap.

The following example wraps 1 Token before deploying the contracts defined into the
default /conf directory of pm-scripts project:

`node lib/main.js deploy -w 1e18`

## Tournament operators
You should include in `package.json` your pm-apollo-token version with the deployed contract you want to use.
By default it's using `npm install @gnosis.pm/pm-apollo-token`.

## Getting help

`node lib/main.js -help`

## Resolving markets
In order to resolve markets you will have to specify, inside the market definition file, the winningOutcome property.
Pay attention on the market type, for Scalar markets the winning outcome will ever be a value between the
upper and lower bound of the market accordingly the number of decimals for the market.
For categorical markets, the winningOutcome will ever be the index of the outcome in the 0-index outcomes array property.

Finally run

`node lib/main.js resolve`

## Fetch markets data: pm-trading-db API
[pm-trading-db](https://github.com/gnosis/pm-trading-db/) provides a handy Rest API serving all markets created on top of Gnosis.
Once you create a market, go to https://pm-trading-db.rinkeby.gnosis.pm:443/api/markets/{market_address} replace {market_address} with the address of your market and you will get access to all the market's data.

## Using Custom Oracles

By default pm-scripts supports the CentralizedOracle only. Of course you would need to use a specific oracle, follow this few steps to enable it:

* Deploy your oracle on your testnet or mainnet
* Copy the recent deployed oracle address
* Edit the /config/markets.json file and place a new property **oracleAddress** inside those markets you want to be created by that oracle: "oracleAddress": "0x..0"
* Go ahead and deploy the markets

You will now be able to create markets using the specified oracle.


## Claim Rewards

In order to execute the Reward Claim feature the following configuration property must be added to the config.json file.
It specifies the Reward Claim contract address, the levels property, which defines the respective amount of winnings for each winner in the top X (number of levels in the array) positions from the scoreboard.
As the Reward Contract could be running on a different chain than the contracts, you have to specify the blockchain property as described below:

```
  "rewardClaimHandler": {
    "blockchain": {
      "protocol": "https",
      "host": "node.rinkeby.gnosisdev.com",
      "port": "443"
    },
    "address": "0x42331cbc7D15C876a38C1D3503fBAD0964a8D72b",
    "duration": 86400,
    "levels": [
      { "value": 5, "minRank": 1, "maxRank": 1 },
      { "value": 4, "minRank": 2, "maxRank": 2 },
      { "value": 3, "minRank": 3, "maxRank": 3 },
      { "value": 2, "minRank": 4, "maxRank": 4 },
      { "value": 1, "minRank": 5, "maxRank": 5 },
      { "value": 0.9, "minRank": 6, "maxRank": 7 },
      { "value": 0.8, "minRank": 8, "maxRank": 9 },
      { "value": 0.7, "minRank": 10, "maxRank": 11 },
      { "value": 0.6, "minRank": 12, "maxRank": 13 },
      { "value": 0.5, "minRank": 14, "maxRank": 15 },
      { "value": 0.4, "minRank": 16, "maxRank": 17 },
      { "value": 0.3, "minRank": 18, "maxRank": 19 },
      { "value": 0.2, "minRank": 19, "maxRank": 34 },
      { "value": 0.1, "minRank": 34, "maxRank": 100 }
    ]
  }
 ```
 
 To execute the Claim Reward just run the following command:
 
 ```node lib/main.js claimrewards```
 
 You can specify a custom config file path by running:
 
 ```node lib/main.js claimrewards -f /path/to/config.json```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
