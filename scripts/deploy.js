async function main() {
  // 배포할 계약의 컨트랙트 객체 가져오기
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const TABToken = await ethers.getContractFactory("TABToken");
  const token = await TABToken.deploy();

  console.log("Token deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
