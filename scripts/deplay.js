const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const TABToken = await ethers.getContractFactory("TABToken");
  const token = await upgrades.deployProxy(TABToken, [], { initializer: 'initialize' });

  console.log("TABToken deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
