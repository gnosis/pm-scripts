# gnosis-sdk-utils

Gnosis SDK Utils is a command line tool which allows users to create and resolve prediction markets on top of Gnosis.

The Gnosis SDK Utils should work for any OS. It has the following system requirements:

* Node.js (versions >= 7 should work)
* NPM (should be installed with Node.js, and versions >= 5 should work)


## Configuration
The *conf* directory contains all the configuration files needed by the SDK, which are: **config.json** and **markets.json**.
Besides that files, you can always specify any configuration file by providing its path as a parameter to the SDK as described in [How to run the SDK](#how-to-run-the-sdk) paragraph.

### Config.json
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
In order to create markets on top of Gnosis each market in the configuration file must provide the following properties, as also examplified in the *examples* directory:

##### Title
The title of the market.

##### Description
A text field describing the title of the market.

##### resolutionDate
Defines when the prediction market ends, you can always resolve a market before its resolutionDate expires.

##### outcomeType
Defines the prediction market type. You must strictly provide 'CATEGORICAL' or 'SCALAR'.

##### currency
A text field defining which currency is holding the market's funds.

##### fee
A text field defining the amount of fee held by the market creator. More info on the dedicated GnosisJS [documentation](https://gnosisjs.readthedocs.io/en/latest/events-oracles-and-markets.html#markets-and-automated-market-makers).

##### funding
A text field representing how much funds to provid the market with.

##### winningOutcome
A text field representing the winning outcome. If declared, the SDK will try to resolve the market, but will always ask you to confirm before proceeding.


Accordingly to the outcomeType, in case of 'SCALAR' market, you will also have to specify the following properties


##### upperBound
A text field representing the upper bound of the predictions range. More info on GnosisJS [documentation](https://gnosisjs.readthedocs.io/en/latest/events-oracles-and-markets.html#events-with-scalar-outcomes)

##### lowerBound
A text field representing the lower bound of the predictions range.

##### decimals
Values are passed in as whole integers and adjusted to the right order of magnitude according to the decimals property of the event description, which is a numeric integer.

##### unit
A text field representing the market's unit of measure, like '%' or '°C' etc...

and for Categorical markets:

##### outcomes
An array of text fields representing the available outcomes for the market.


### How to run the SDK
The main SDK entry point is the lib/main.js file.
The two main options are *deploy* and *resolve*:
`node lib/main.js deploy`
`node lib/main.js resolve`

You can also supply a custom SDK configuration file and markets' file by providing the *-f* and *-m* parameters
followed by the full absolute path to your files:
`node lib/main.js deploy -f path/to/sdk/config -m path/to/markets/file`

In order to fund markets you may want to wrap Ethers to Collater Tokens.
Just provide the *-w* parameter followed by the amount of tokens you want to wrap.
The following example wraps 1 Token before deploying the contracts defined into the
default /conf directory of the SDK project:
`node lib/main.js deploy -w 1e18`


#### Getting help
node lib/main.js -help

#### Resolving markets
In order to resolve markets you will have to specify, inside the market definition file, the winningOutcome property.
Pay attention on the market type, for Scalar markets the winning outcome will ever be a value between the upper and lower bound of the market accordingly the number of decimals for the market. For categorical markets, the winningOutcome will ever be the index of the outcome in the 0-index outcomes array property.

Finally run `node lib/main.js resolve`.
