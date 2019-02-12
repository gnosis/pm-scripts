# run-with-testrpc doesn't detect $MNEMONIC env variable
# Use ganache's default mnemonic
export MNEMONIC='myth like bonus scare over problem client lizard pioneer submit female collect'
export PRIVATE_KEY='4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
node node_modules/.bin/run-with-testrpc  -l 10000000000 -i 437894314312 -d 'cd node_modules/\@gnosis.pm/pm-contracts/ && truffle migrate --network quickstart && cd ../../../ && mocha --exit -t 5000 --require babel-register tests/*'
