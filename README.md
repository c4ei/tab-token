# erc20-token
ERC-20 Token implementations

1. Clone the repository
2. In the project root create a file .env and add:
   
    `PRIVATE_KEY="your_private_key"`
   
    `INFURA_SEPOLIA_ENDPOINT="your_infura_sepolia_api_key"`
4.  Install the project dependencies: `npm install`
5.  Compile the contracts: `npx hardhat compile`
6.  Test the contracts: `npx hardhat test test/GLDToken_test.ts --typecheck`
7.  Deploy the contract: `npx hardhat run scripts/deployGLDToken.ts --network sepolia`
