require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    testrpc: {
      

      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      from: "0xE6b62f962625eCF490b3152a5E0943fB1717565A",
      network_id: "4",
      gas: 4600000
    }
  }
};
