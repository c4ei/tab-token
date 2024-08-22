async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Token = await ethers.getContractFactory("TABToken");
  const token = await Token.deploy();

  console.log("Token deployed to:", token.address);
  console.log("Contract owner is:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
});
