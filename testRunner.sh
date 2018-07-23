# run-with-testrpc doesn't detect $MNEMONIC env variable
export MNEMONIC='gnosis test rpc account ethereum blockchain devops database network software app server'
node node_modules/.bin/run-with-testrpc  -l 10000000000 --mnemonic 'gnosis test rpc account ethereum blockchain devops database network software app server' 'cd node_modules/\@gnosis.pm/pm-contracts/ && truffle migrate && cd ../../../ && mocha -t 5000 --require babel-register tests/*'
