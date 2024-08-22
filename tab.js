require('dotenv').config();
const { ethers } = require('ethers');

// 환경 변수 로드
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS;

// 프로바이더 및 지갑 설정
const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ERC20 계약 ABI (부분적으로)
const tokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function freezeAccount(address account, uint256 daysToFreeze)",
  "function isFrozen(address account) view returns (bool)",
  "function lockedBalanceOf(address account) view returns (uint256)",
  "function setLockedBalance(address account, uint256 amount)"
];

// 토큰 계약 객체 생성
const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenABI, wallet);

async function getBalance(address) {
  const balance = await tokenContract.balanceOf(address);
  console.log(`Balance of ${address}: ${ethers.formatUnits(balance, 18)} tokens`);
}

async function mintTokens(to, amount) {
  const tx = await tokenContract.mint(to, ethers.parseUnits(amount, 18));
  await tx.wait();
  console.log(`Minted ${amount} tokens to ${to}`);
}

async function burnTokens(amount) {
  const tx = await tokenContract.burn(ethers.parseUnits(amount, 18));
  await tx.wait();
  console.log(`Burned ${amount} tokens`);
}

async function transferTokens(to, amount) {
  const tx = await tokenContract.transfer(to, ethers.parseUnits(amount, 18));
  await tx.wait();
  console.log(`Transferred ${amount} tokens to ${to}`);
}

async function freezeAccount(account, daysToFreeze) {
  const tx = await tokenContract.freezeAccount(account, daysToFreeze);
  await tx.wait();
  console.log(`Account ${account} frozen for ${daysToFreeze} days`);
}

async function checkFrozen(account) {
  const isFrozen = await tokenContract.isFrozen(account);
  console.log(`Account ${account} frozen status: ${isFrozen}`);
}

async function getLockedBalance(account) {
  const lockedBalance = await tokenContract.lockedBalanceOf(account);
  console.log(`Locked balance of ${account}: ${ethers.formatUnits(lockedBalance, 18)} tokens`);
}

async function setLockedBalance(account, amount) {
  const tx = await tokenContract.setLockedBalance(account, ethers.parseUnits(amount, 18));
  await tx.wait();
  console.log(`Locked balance of ${account} set to ${amount} tokens`);
}

// 예제 사용
(async () => {
  const myAddress = '0xYourAddress';
  await getBalance(myAddress);
  await mintTokens(myAddress, '100');
  await transferTokens('0xRecipientAddress', '50');
  await burnTokens('10');
  await freezeAccount(myAddress, 5);
  await checkFrozen(myAddress);
  await setLockedBalance(myAddress, '200');
  await getLockedBalance(myAddress);
})();
