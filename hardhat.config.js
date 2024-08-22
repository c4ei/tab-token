require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

const { PRIVATE_KEY, INFURA_PROJECT_ID } = process.env;

module.exports = {
  solidity: "0.8.24",
  networks: {
    AAH: {
      url: "https://rpc.c4ex.net",
      accounts: [`0x${PRIVATE_KEY}`]
    },
    C4EI: {
      url: "https://rpc.c4ei.net",
      accounts: [`0x${PRIVATE_KEY}`]
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  }
};


