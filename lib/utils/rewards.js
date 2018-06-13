'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _truffleContract = require('truffle-contract');

var _truffleContract2 = _interopRequireDefault(_truffleContract);

var _ethereum = require('./../clients/ethereum');

var _ethereum2 = _interopRequireDefault(_ethereum);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var claimRewards = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(configInstance) {
        var providerUrl, client, web3, rewardClaimHandlerArtifact, rewardContract, rewardInstance, tokenAddress, gnosisDB, gnosisDBUrl, scoreboardResult, filteredScoreboard, winnersAddresses, rewardAmounts, totalAmount, approveTx, registerTx;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;

                        if (!(!configInstance.rewardClaimHandler || !configInstance.rewardClaimHandler.address)) {
                            _context.next = 3;
                            break;
                        }

                        throw new Error('rewardClaimHandler is required');

                    case 3:

                        // Use another web3
                        providerUrl = configInstance.rewardClaimHandler.blockchain.protocol + '://' + configInstance.rewardClaimHandler.blockchain.host + ':' + configInstance.rewardClaimHandler.blockchain.port;
                        client = new _ethereum2.default(configInstance.mnemonic, providerUrl);
                        web3 = client.getWeb3();
                        rewardClaimHandlerArtifact = require('@gnosis.pm/pm-apollo-contracts/build/contracts/RewardClaimHandler.json');
                        rewardContract = (0, _truffleContract2.default)(rewardClaimHandlerArtifact);

                        rewardContract.setProvider(client.getProvider());
                        rewardInstance = rewardContract.at(configInstance.rewardClaimHandler.address);

                        // Get token from the reward contract instance

                        _context.next = 12;
                        return rewardInstance.rewardToken();

                    case 12:
                        tokenAddress = _context.sent;


                        // Get scoreboard
                        gnosisDB = configInstance.gnosisDB;
                        gnosisDBUrl = gnosisDB.protocol + '://' + gnosisDB.host + ':' + gnosisDB.port + '/api/scoreboard/';
                        _context.next = 17;
                        return _axios2.default.get(gnosisDBUrl);

                    case 17:
                        scoreboardResult = _context.sent;
                        filteredScoreboard = scoreboardResult.data.results.slice(0, configInstance.rewardClaimHandler.levels.length);

                        // Get rewards

                        winnersAddresses = [];
                        rewardAmounts = [];

                        filteredScoreboard.map(function (item, index) {
                            winnersAddresses.push(item.account);
                            rewardAmounts.push(configInstance.rewardClaimHandler.levels[index]['value']);
                        });

                        // calculate totalAmount
                        totalAmount = rewardAmounts.reduce(function (a, b) {
                            return a + b;
                        });

                        // Approve reward token

                        _context.next = 25;
                        return approve(client.getProvider(), configInstance.account, tokenAddress, configInstance.rewardClaimHandler.address, totalAmount);

                    case 25:
                        approveTx = _context.sent;
                        _context.next = 28;
                        return rewardInstance.registerRewards(winnersAddresses, rewardAmounts, configInstance.rewardClaimHandler.duration, { from: configInstance.account, gas: 200000 });

                    case 28:
                        registerTx = _context.sent;

                        if (!(registerTx.receipt && registerTx.receipt.status == '0x0' || registerTx.receipt && registerTx.receipt.status == 0)) {
                            _context.next = 31;
                            break;
                        }

                        throw new Error('Reward Claim transaction failed');

                    case 31:
                        return _context.abrupt('return', registerTx);

                    case 34:
                        _context.prev = 34;
                        _context.t0 = _context['catch'](0);
                        throw _context.t0;

                    case 37:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined, [[0, 34]]);
    }));

    return function claimRewards(_x) {
        return _ref.apply(this, arguments);
    };
}();

var approve = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(provider, sender, tokenAddress, rewardClaimAddress, amount) {
        var result, tokenArtifact, tokenContract, tokenInstance;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        result = void 0;

                        if (tokenAddress) {
                            _context2.next = 3;
                            break;
                        }

                        throw new Error('Provided tokenAddress is invalid, got ' + tokenAddress);

                    case 3:
                        if (rewardClaimAddress) {
                            _context2.next = 5;
                            break;
                        }

                        throw new Error('Provided rewardClaimAddress is invalid, got ' + rewardClaimAddress);

                    case 5:
                        if (!(!amount || amount <= 0)) {
                            _context2.next = 7;
                            break;
                        }

                        throw new Error('Cannot approv invalid amounts of Ether, got ' + amount + ' ETH');

                    case 7:
                        _context2.prev = 7;
                        tokenArtifact = require('@gnosis.pm/pm-apollo-contracts/build/contracts/Token.json');
                        tokenContract = (0, _truffleContract2.default)(tokenArtifact);

                        tokenContract.setProvider(provider);
                        tokenInstance = tokenContract.at(tokenAddress);

                        // Do tokens transfer approval

                        _context2.next = 14;
                        return tokenInstance.approve(rewardClaimAddress, amount, { from: sender });

                    case 14:
                        result = _context2.sent;

                        if (!(result.receipt && result.receipt.status == '0x0' || result.receipt && result.receipt.status == 0)) {
                            _context2.next = 17;
                            break;
                        }

                        throw new Error('Approve token transaction failed');

                    case 17:
                        return _context2.abrupt('return', result);

                    case 20:
                        _context2.prev = 20;
                        _context2.t0 = _context2['catch'](7);
                        throw _context2.t0;

                    case 23:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined, [[7, 20]]);
    }));

    return function approve(_x2, _x3, _x4, _x5, _x6) {
        return _ref2.apply(this, arguments);
    };
}();

module.exports = {
    claimRewards: claimRewards
};