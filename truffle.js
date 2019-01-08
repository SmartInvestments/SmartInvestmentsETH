require('babel-register');
require('babel-polyfill');

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            gas: 8000000,
            network_id: "*",
            gasPrice: 1
        },
        rinkeby: {
            network_id: 4,
            from: "0x3276Dc497C6C023cAB3dF9875D55D95cbCEdb093",
            host: "localhost", // Connect to geth on the specified
            port: 8545,
            gas: 8000000, // Gas limit used for deploys
        },
        live: {
            host: "0.0.0.0",
            port: 8545,
            network_id: "*",
            gas: 3000000
        }
    },
    rpc: {
        host: "0.0.0.0",
        port: 8545
    },
    compilers: {
        solc: {
            version: "0.4.24",
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    }
};
