require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// 환경 변수 로드
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS;

// 프로바이더 및 지갑 설정
const provider = new ethers.providers.JsonRpcProvider(`https://rpc.c4ex.net`);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// // ERC20 계약 ABI (부분적으로)
// const tokenABI = [
//   "function balanceOf(address owner) view returns (uint256)",
//   "function mint(address to, uint256 amount)",
//   "function burn(uint256 amount)",
//   "function transfer(address to, uint256 amount) returns (bool)",
//   "function freezeAccount(address account, uint256 daysToFreeze)",
//   "function isFrozen(address account) view returns (bool)",
//   "function lockedBalanceOf(address account) view returns (uint256)",
//   "function setLockedBalance(address account, uint256 amount)",
//   "function owner() view returns (address)"
// ];
// ABI 파일 경로
const abiFilePath = path.join(__dirname, 'abi', 'TABTokenABI.json');
const tokenABI = JSON.parse(fs.readFileSync(abiFilePath, 'utf8'));

// 토큰 계약 객체 생성
const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenABI, wallet);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// console.log("Contract ABI:", tokenABI);
console.log("Contract address:", TOKEN_CONTRACT_ADDRESS);
console.log("Wallet address:", wallet.address);

// 메인 페이지
app.get('/', async (req, res) => {
    try {
        const owner = await tokenContract.owner();
        console.log("Contract owner:", owner); // 디버깅 로그 추가
        res.render('index', { owner });
    } catch (error) {
        console.error("Error fetching owner:", error); // 디버깅 로그 추가
        res.status(500).send({ error: error.message });
    }
});

// 잔액 조회
app.post('/balance', async (req, res) => {
    try {
        const { address } = req.body;
        const balance = await tokenContract.balanceOf(address);
        res.render('index', { balance: ethers.utils.formatUnits(balance, 18), address });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// 토큰 발행
app.post('/mint', async (req, res) => {
    try {
        const { to, amount } = req.body;
        const owner = await tokenContract.owner();
        if (wallet.address !== owner) {
            return res.status(403).send({ error: "You are not the owner" });
        }
        const tx = await tokenContract.mint(to, ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        res.redirect('/');
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// 토큰 소각
app.post('/burn', async (req, res) => {
    try {
        const { amount } = req.body;
        const tx = await tokenContract.burn(ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        res.redirect('/');
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// 토큰 전송
app.post('/transfer', async (req, res) => {
    try {
        const { to, amount } = req.body;
        const tx = await tokenContract.transfer(to, ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        res.redirect('/');
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// 계정 정지
app.post('/freeze', async (req, res) => {
    try {
        const { account, daysToFreeze } = req.body;
        const tx = await tokenContract.freezeAccount(account, daysToFreeze);
        await tx.wait();
        res.redirect('/');
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// 계정 정지 상태 조회
app.post('/isFrozen', async (req, res) => {
    try {
        const { account } = req.body;
        const isFrozen = await tokenContract.isFrozen(account);
        res.render('index', { isFrozen, address: account });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// 락된 잔액 조회
app.post('/lockedBalance', async (req, res) => {
    try {
        const { account } = req.body;
        const lockedBalance = await tokenContract.lockedBalanceOf(account);
        res.render('index', { lockedBalance: ethers.utils.formatUnits(lockedBalance, 18), address: account });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// 락된 잔액 설정
app.post('/setLockedBalance', async (req, res) => {
    try {
        const { account, amount } = req.body;
        const tx = await tokenContract.setLockedBalance(account, ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        res.redirect('/');
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
