# gnosis-sdk-utils

Gnosis SDK Utils is a command line tool which allows users to create and resolve prediction markets on top of Gnosis.

The Gnosis SDK Utils should work for any OS. It has the following system requirements:

* Node.js (versions >= 7 should work)
* NPM (should be installed with Node.js, and versions >= 5 should work)


## Configuration
The *conf* directory contains all the configuration files needed by the SDK, which are: config.json and markets.json

### Config.json
Contains the main SDK configuration and presents the following structure:

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

* mnemonic, is your HD wallet mnemonic phrase;
* account, is your ethereum address, all transactions will be sent from this address. If not provided, the SDK will calculate it from your mnemonic phrase;
* blockchain, defines the Ethereum Node the SDK should send transactions to (https://rinkeby.infura.io/gnosis/ by default);
* gnosisDB, defines the GnosisDB url (https://gnosisdb.staging.gnosisdev.com:443 by default);
* ipfs, sets the IPFS node the SDK should send transactions to (https://ipfs.infura.io:5001 by default);
* gasPrice, the desidered gasPrice
* collateralToken, the Collateral Token contract's address (Rinkeby: 0xd19bce9f7693598a9fa1f94c548b20887a33f141)

### Market.json
Contains a JSON array and defines all the markets you want to create and manage.

#### Market properties
TODO

### How to run the SDK
The main SDK entry point is the lib/main.js file.
The two main options are *deploy* and *resolve*:
* node lib/main.js deploy
* node lib/main.js resolve

You can also supply a custom SDK configuration file and markets' file by providing the *-f* and *-m* parameters
followed by the full absolute path to your files:
* node lib/main.js deploy -f path/to/sdk/config -m path/to/markets/file

In order to fund markets you may want to wrap Ethers to Collater Tokens.
Just provide the *-w* parameter followed by the amount of tokens you want to wrap.
The following example wraps 1 Token before deploying the contracts defined into the
default /conf directory of the SDK project:
* node lib/main.js deploy -w 1e18


#### Getting help
node lib/main.js -help
