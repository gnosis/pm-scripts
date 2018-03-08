# run-with-testrpc doesn't detect $MNEMONIC env variable
export MNEMONIC='gnosis test rpc account ethereum blockchain devops database network software app server'
node node_modules/.bin/run-with-testrpc --mnemonic 'gnosis test rpc account ethereum blockchain devops database network software app server' 'cd node_modules/\@gnosis.pm/gnosis-core-contracts/ && truffle migrate && cd ../../../ && mocha --require babel-register tests/*'
