# gnosis-sdk-utils

Gnosis SDK Utils is a command line tool which allows users to create and resolve prediction markets on top of Gnosis.

## Index of contents

- [Installation](#installation)
- [Supported chains](#supported-chains)
- [Configuration](#configuration)
- [Tournament operators](#tournament-operators)
- [Getting help](#getting-help)
- [Resolving markets](#resolving-markets)
- [Fetch markets data](#fetch-markets-data-gnosisdb-api)
- [Using custom oracles](#using-custom-oracles)
- [License](#license)

## Installation

The Gnosis SDK Utils should work for any OS. It has the following system requirements:

* Node.js (versions >= 7 should work)
* NPM (should be installed with Node.js, and versions >= 5 should work)

To install all the required software dependencies clone the project, go to the root folder and run:

```npm install```

## Supported chains
The SDK can work with either Mainnet, Rinkeby, Kovan or Ropsten networks.
[GnosisDB](https://github.com/gnosis/gnosisdb/) currently supports only Mainnet and Rinkeby networks.
In order to deploy contract on Kovan or Ropsten you would need to install an instance of
[GnosisDB](https://github.com/gnosis/gnosisdb/) with the specific Ethereum node settings.
We encourage users to **use the Rinkeby network**.

## Configuration
The *conf* directory contains all the configuration files needed by the SDK, which are: **config.json** and **markets.json**.
Besides that files, you can always specify any configuration file by providing its path as a parameter to the SDK as described in [How to run the SDK](#how-to-run-the-sdk) paragraph.

### conf/config.json
Contains the main SDK configuration and has the following structure:

```
{
  "mnemonic": "(REQUIRED) YOUR MNEMONIC PHRASE",
  "account": "YOUR ACCOUNT ADDRESS",
  "blockchain": {
    "protocol": "https",
    "host": "rinkeby.infura.io/gnosis/",
    "port": "443"
  },
  "gnosisDB": {
    "protocol": "https",
    "host": "gnosisdb.staging.gnosisdev.com",
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

* **mnemonic**, is your HD wallet mnemonic phrase composed by 12 words ([HD wallet repository](https://github.com/trufflesuite/truffle-hdwallet-provider));
* **account**, is your ethereum address, all transactions will be sent from this address. If not provided, the SDK will calculate it from your mnemonic phrase;
* **blockchain**, defines the Ethereum Node the SDK should send transactions to (https://rinkeby.infura.io/gnosis/ by default);
* **gnosisDB**, defines the [GnosisDB](https://github.com/gnosis/gnosisdb/) url, an Ethereum indexer which exposes a handy API to get your list of markets and their details (default: https://gnosisdb.rinkeby.gnosis.pm:443);
* **ipfs**, sets the IPFS node the SDK should send transactions to (https://ipfs.infura.io:5001 by default);
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
A text field defining the amount of fee held by the market creator. More info on the dedicated [GnosisJS documentation](https://gnosisjs.readthedocs.io/en/latest/events-oracles-and-markets.html#markets-and-automated-market-makers).

##### funding
A text field representing how much funds to provid the market with.

##### winningOutcome
A text field representing the winning outcome. If declared, the SDK will try to resolve the market, but will always ask you to confirm before proceeding.

##### outcomeType
Defines the prediction market type. You must strictly provide 'CATEGORICAL' or 'SCALAR' (categorical market
or scalar market).

##### upperBound (scalar markets)
A text field representing the upper bound of the predictions range. More info on [GnosisJS documentation](https://gnosisjs.readthedocs.io/en/latest/events-oracles-and-markets.html#events-with-scalar-outcomes).

##### lowerBound (scalar markets)
A text field representing the lower bound of the predictions range.

##### decimals (scalar markets)
Values are passed in as whole integers and adjusted to the right order of magnitude according to the decimals property of the event description, which is a numeric integer.

##### unit (scalar markets)
A text field representing the market's unit of measure, like '%' or '°C' etc...

##### outcomes (categorical markets)
An array of text fields representing the available outcomes for the market.


### How to run the SDK
Before getting started **make sure you hold enough balance on your account** or transactions could fail.

The main SDK entry point is the lib/main.js file.
The two main options are **deploy** and **resolve**:

```
node lib/main.js deploy
node lib/main.js resolve
```

After you deploy *markets.json* will be updated with the addresses deployed and the ipfsHashes.

You can also supply a custom SDK configuration file and markets' file by providing the *-f* and *-m* parameters
followed by the full absolute path to your files:

`node lib/main.js deploy -f path/to/sdk/config -m path/to/markets/file`

In order to fund markets you may want to wrap Ethers to Collateral Tokens.
Just provide the *-w* parameter followed by the amount of tokens you want to wrap.

The following example wraps 1 Token before deploying the contracts defined into the
default /conf directory of the SDK project:

`node lib/main.js deploy -w 1e18`

#### Tournament operators
You should include in `package.json` your olympia-token version with the deployed contract you want to use.
By default it's using `npm install @gnosis.pm/olympia-token`.

## Getting help

`node lib/main.js -help`

## Resolving markets
In order to resolve markets you will have to specify, inside the market definition file, the winningOutcome property.
Pay attention on the market type, for Scalar markets the winning outcome will ever be a value between the
upper and lower bound of the market accordingly the number of decimals for the market.
For categorical markets, the winningOutcome will ever be the index of the outcome in the 0-index outcomes array property.

Finally run

`node lib/main.js resolve`

## Fetch markets data: GnosisDB API
[GnosisDB](https://github.com/gnosis/gnosisdb/) provides a handy Rest API serving all markets created on top of Gnosis.
Once you create a market, go to https://gnosisdb.rinkeby.gnosis.pm:443/api/markets/{market_address} replace {market_address} with the address of your market and you will get access to all the market's data.

## Using Custom Oracles

By default the sdk supports the CentralizedOracle only. Of course you would need to use a specific oracle, follow this few steps to enable it:

* Deploy your oracle on your testnet or mainnet
* Copy the recend deployed oracle address
* Edit the /config/markets.json file and place a new property **oracleAddress** inside those markets you want to be created by that oracle: "oracleAddress": "0x..0"
* Go ahead and deploy the markes

You will now be able to create markets using the specified oracle.


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
