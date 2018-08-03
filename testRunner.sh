# run-with-testrpc doesn't detect $MNEMONIC env variable
export MNEMONIC='gnosis test rpc account ethereum blockchain devops database network software app server'
export PRIVATE_KEY='bf610ee7c872af122ed86d4aefdbf37c92f820debb5b94c6ffb8274d965c4ea2'
node node_modules/.bin/run-with-testrpc  -l 10000000000 --mnemonic 'gnosis test rpc account ethereum blockchain devops database network software app server' 'cd node_modules/\@gnosis.pm/pm-contracts/ && truffle migrate && cd ../../../ && mocha --exit -t 5000 --require babel-register tests/*'
