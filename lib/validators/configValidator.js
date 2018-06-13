'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseValidator = require('./baseValidator');

var _baseValidator2 = _interopRequireDefault(_baseValidator);

var _exceptions = require('./exceptions');

var _ethereum = require('../clients/ethereum');

var _ethereum2 = _interopRequireDefault(_ethereum);

var _constants = require('../utils/constants');

var _os = require('../utils/os');

var _gnosisjs = require('@gnosis.pm/gnosisjs');

var _gnosisjs2 = _interopRequireDefault(_gnosisjs);

var _olympiaToken = require('@gnosis.pm/olympia-token');

var _olympiaToken2 = _interopRequireDefault(_olympiaToken);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ConfigValidator = function (_BaseValidator) {
  (0, _inherits3.default)(ConfigValidator, _BaseValidator);

  function ConfigValidator(configPath) {
    (0, _classCallCheck3.default)(this, ConfigValidator);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ConfigValidator.__proto__ || (0, _getPrototypeOf2.default)(ConfigValidator)).call(this));

    _this._configPath = configPath;
    _this._fields = [{
      'name': 'mnemonic',
      'validators': ['required']
    }, {
      'name': 'blockchain',
      'validators': ['httpObject']
    }, {
      'name': 'collateralToken',
      'validators': ['requiredEthAddress']
    }, {
      'name': 'account',
      'setters': ['declaredOrDefaultAccount'],
      'validators': ['hasBalance']
    }];

    _this._systemCheks = [{
      'name': 'hasWritePermissions',
      'args': [_this._configPath]
    }];

    _this._defaults = {
      'gnosisDB': {
        'protocol': 'https',
        'host': 'gnosisdb.rinkeby.gnosis.pm',
        'port': 443
      },
      'ipfs': {
        'protocol': 'https',
        'host': 'ipfs.infura.io',
        'port': 5001
      }
    };
    return _this;
  }

  /**
  * Read and convert the configuration into a Javascript object.
  * @throws: Error
  */


  (0, _createClass3.default)(ConfigValidator, [{
    key: 'load',
    value: function load() {
      // read file
      var config = _fs2.default.readFileSync(this._configPath);
      // convert Bytes to JSON
      this._config = JSON.parse(config);
    }

    /**
    * Getters / Setters
    */

  }, {
    key: 'getConfig',
    value: function getConfig() {
      return this._config;
    }
  }, {
    key: 'setConfig',
    value: function setConfig(config) {
      this._config = config;
    }
  }, {
    key: 'getClient',
    value: function getClient(providerUrl) {
      if (!providerUrl) {
        providerUrl = this.getProviderUrl();
      }
      var client = new _ethereum2.default(this._config.mnemonic, providerUrl, 1);
      return client;
    }
  }, {
    key: 'getProviderUrl',
    value: function getProviderUrl() {
      return this._config.blockchain.protocol + '://' + this._config.blockchain.host + ':' + this._config.blockchain.port;
    }
  }, {
    key: 'getGnosisDBUrl',
    value: function getGnosisDBUrl() {
      if (!this.objectPropertiesRequired(this._config.gnosisDB, ['protocol', 'host', 'port'])) {
        // use default
        return this._defaults.gnosisDB.protocol + '://' + this._defaults.gnosisDB.host + ':' + this._defaults.gnosisDB.port;
      } else {
        return this._config.gnosisDB.protocol + '://' + this._config.gnosisDB.host + ':' + this._config.gnosisDB.port;
      }
    }
  }, {
    key: 'getIpfsObject',
    value: function getIpfsObject() {
      if (!this.objectPropertiesRequired(this._config.ipfs, ['protocol', 'host', 'port'])) {
        return {
          'protocol': this._defaults.ipfs.protocol,
          'host': this._defaults.ipfs.host,
          'port': this._defaults.ipfs.port
        };
      }
      return this._config.ipfs;
    }
  }, {
    key: 'getIPFSUrl',
    value: function getIPFSUrl() {
      if (!this.objectPropertiesRequired(this._config.ipfs, ['protocol', 'host', 'port'])) {
        // use default
        return this._defaults.ipfs.protocol + '://' + this._defaults.ipfs.host + ':' + this._defaults.ipfs.port;
      } else {
        return this._config.ipfs.protocol + '://' + this._config.ipfs.host + ':' + this._config.ipfs.port;
      }
    }

    /**
    * Run validators
    * @param field, see _fields property
    * @throws ValidationError
    */

  }, {
    key: 'runValidators',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(field) {
        var x, item;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                x = 0;

              case 1:
                if (!(x < field.validators.length)) {
                  _context.next = 10;
                  break;
                }

                item = field.validators[x];
                _context.next = 5;
                return this[item](this._config[field.name]);

              case 5:
                if (_context.sent) {
                  _context.next = 7;
                  break;
                }

                throw new _exceptions.ValidationError('JSON Configuration field ' + field.name + ' didn\'t pass ' + item + ' validation. Got: ' + this._config[field.name]);

              case 7:
                x++;
                _context.next = 1;
                break;

              case 10:
                return _context.abrupt('return', true);

              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function runValidators(_x) {
        return _ref.apply(this, arguments);
      }

      return runValidators;
    }()

    /**
    * Executes system checks, raise error if something went wrong.
    * @param systemChecks, see _systemCheks property
    * @throws SystemCheckError
    */

  }, {
    key: 'runSystemChecks',
    value: function runSystemChecks(systemChecks) {
      for (var x = 0; x < systemChecks.length; x++) {
        var check = systemChecks[x];
        try {
          if (check.args && check.args.length > 0) {
            this[check.name].apply(this, (0, _toConsumableArray3.default)(check.args));
          } else {
            this[check.name]();
          }
        } catch (error) {
          throw error;
        }
      }
    }

    /**
    * Normalizes the configuration.
    * Converts addresses to lowercase
    * Set blockchainUrl, blockchainProvider, gnosisDBUrl, ipfsUrl
    * Set GnosisJS instance
    * Keep blockchain, gnosisdb and ipfs objects
    * @return normalized configuration
    */

  }, {
    key: 'normalize',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var client, newConfig, gnosisOptions, gnosisjsInstance;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                client = this.getClient();
                newConfig = (0, _assign2.default)({}, this._config);

                newConfig.account = newConfig.account.toLowerCase();
                newConfig.blockchainProvider = client;
                newConfig.blockchainUrl = this.getProviderUrl();
                newConfig.gnosisDBUrl = this.getGnosisDBUrl();
                newConfig.ipfs = this.getIpfsObject();
                newConfig.ipfsUrl = this.getIPFSUrl();
                newConfig.collateralToken = newConfig.collateralToken.toLowerCase();
                // GnosisJS instance options
                gnosisOptions = {
                  ethereum: client.getProvider(),
                  ipfs: newConfig.ipfs,
                  gnosisdb: newConfig.gnosisDBUrl,
                  defaultAccount: newConfig.account

                  // Create GnosisJS instance
                };
                _context2.next = 12;
                return _gnosisjs2.default.create(gnosisOptions);

              case 12:
                gnosisjsInstance = _context2.sent;
                _context2.next = 15;
                return gnosisjsInstance.importContracts(_olympiaToken2.default, {
                  OlympiaToken: 'olympiaToken',
                  AddressRegistry: 'olympiaAddressRegistry',
                  PlayToken: 'playToken',
                  RewardClaimHandler: 'rewardClaimHandler'
                });

              case 15:
                newConfig.gnosisJS = gnosisjsInstance;
                // Set new updated config
                this.setConfig(newConfig);

              case 17:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function normalize() {
        return _ref2.apply(this, arguments);
      }

      return normalize;
    }()

    /**
    * @return True if the configuration if valid, throws an error otherwise
    * @throws Error
    */

  }, {
    key: 'isValid',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var x, field, y, setter;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // Load configuration
                this.load();
                // Execute system checks, can raise errors, in that case stop the execution
                try {
                  this.runSystemChecks(this._systemCheks);
                } catch (error) {
                  // Exit on failure
                  console.warn('System checks went wrong, aborting.', error);
                  process.exit(1);
                }

                // Do validation
                x = 0;

              case 3:
                if (!(x < this._fields.length)) {
                  _context3.next = 23;
                  break;
                }

                field = this._fields[x];
                // If 'setters' property is defined, let's iterate over it first

                if (!field.setters) {
                  _context3.next = 18;
                  break;
                }

                y = 0;

              case 7:
                if (!(y < field.setters.length)) {
                  _context3.next = 14;
                  break;
                }

                setter = field.setters[y];
                _context3.next = 11;
                return this[setter](this._config[field.name]);

              case 11:
                y++;
                _context3.next = 7;
                break;

              case 14:
                _context3.next = 16;
                return this.runValidators(field);

              case 16:
                _context3.next = 20;
                break;

              case 18:
                _context3.next = 20;
                return this.runValidators(field);

              case 20:
                x++;
                _context3.next = 3;
                break;

              case 23:
                return _context3.abrupt('return', true);

              case 24:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function isValid() {
        return _ref3.apply(this, arguments);
      }

      return isValid;
    }()

    /**
    * Custom validators
    */

  }, {
    key: 'declaredOrDefaultAccount',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(account) {
        var client, accounts;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (this.requiredEthAddress(account)) {
                  _context4.next = 8;
                  break;
                }

                // Get default account
                client = this.getClient();
                _context4.next = 4;
                return client.getAccounts();

              case 4:
                accounts = _context4.sent;

                this._config.account = accounts[0];
                _context4.next = 9;
                break;

              case 8:
                this._config.account = account;

              case 9:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function declaredOrDefaultAccount(_x2) {
        return _ref4.apply(this, arguments);
      }

      return declaredOrDefaultAccount;
    }()
  }, {
    key: 'hasBalance',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(account) {
        var balance, providerUrl, client;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                balance = void 0;
                providerUrl = this.getProviderUrl();
                client = new _ethereum2.default(this._config.mnemonic, providerUrl, _constants.HD_WALLET_ACCOUNTS);

                if (!this.requiredEthAddress(account)) {
                  _context5.next = 10;
                  break;
                }

                _context5.next = 6;
                return client.getBalance(account);

              case 6:
                balance = _context5.sent;
                return _context5.abrupt('return', balance > 0);

              case 10:
                if (this.requiredEthAddress(this._config.account)) {
                  _context5.next = 17;
                  break;
                }

                _context5.next = 13;
                return client.getBalance(account);

              case 13:
                balance = _context5.sent;
                return _context5.abrupt('return', balance > 0);

              case 17:
                return _context5.abrupt('return', false);

              case 18:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function hasBalance(_x3) {
        return _ref5.apply(this, arguments);
      }

      return hasBalance;
    }()

    /**
    * System checks
    */

  }, {
    key: 'hasWritePermissions',
    value: function hasWritePermissions(directory) {
      var hasPerms = (0, _os.hasWriteDirectoryPerms)(directory);
      if (!hasPerms) {
        throw new _exceptions.SystemCheckError('You don\'t have enough permissions to write on ' + directory);
      }
    }
  }]);
  return ConfigValidator;
}(_baseValidator2.default);

module.exports = ConfigValidator;