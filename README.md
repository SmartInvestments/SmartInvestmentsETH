# SmartInvestments

[![Build Status](https://travis-ci.org/SmartInvestments/SmartInvestmentsETH.svg)](https://travis-ci.org/SmartInvestments/SmartInvestmentsETH)

Smart contracts for SmartInvestments ecosystem.
Safely platform for investing.

# Deploying contracts

RinkeBy: [0xad9e03d79062c6af96ff77cb00f77400cbe5b766](https://rinkeby.etherscan.io/address/0xad9e03d79062c6af96ff77cb00f77400cbe5b766)

# Test
1. Install [truffle](http://truffleframework.com) globally with `npm install -g truffle`
2. Install [ganache-cli](https://github.com/trufflesuite/ganache-cli) globally with `npm install -g ganache-cli`
3. Install dependency in local directory with `npm install`
4. For start test network use ganache-cli with `scripts/rpc.sh`
5. Run tests with `npm test`

Maybe `npm install` will want python2, then use `npm install --python2.7`.

# Run local ETH network
```bash
chmod +x scripts/rpc.sh # if need
./scripts/rpc.sh
```

# Get WALLETS list in local ETH networks
```bash
truffle console
web3.eth.getAccounts()
```

# Transfer ETH to local network wallet
```bash
truffle console
web3.eth.sendTransaction({from:'<NETWORK_WALLET>', to: '<TARGET_LOCAL_WALLET>', value: web3.utils.toWei('100', 'ether')})
```

# Compile contract
```bash
truffle compile
```

# Deploy to local network
```bash
truffle deploy
```

# Run tests
```bash
truffle compile
npm test
```

# Deploy contract
- Go to https://remix.ethereum.org/
- Upload contract files there.
- Choosing the main contract.
- Deploy it where necessary!
- Everything! You can use!

# truffle config file
- truffle.js
