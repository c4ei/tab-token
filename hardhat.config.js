// require("@nomicfoundation/hardhat-toolbox");
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');

module.exports = {
  solidity: {
    version: "0.8.24", // 사용하려는 Solidity 버전으로 설정
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    AAH: {
      url: "https://rpc.c4ex.net"
    },
    C4EI: {
      url: "https://rpc.c4ei.net"
    }
  }
};
