import { expect } from "chai"; // serve per fare delle asserzioni e può essere accompagnata a qualsiasi testing framework
import { ethers } from "hardhat"; // hre è l'HardhatRuntimeEnvironment, ci serve perchè contiene una versione della libreria ether.js che ci serve per interagire col nostro smart contract
import { formatEther } from "ethers";
import { GLDToken, GLDToken__factory } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("GLDToken contract", () => {
    // global vars
    let Token: GLDToken__factory;
    let oceanToken: GLDToken;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner;
    let addr2: HardhatEthersSigner;
    const TOKEN_CAP: number = 100_000_000;
    const TOKEN_BLOCK_REWARD: number = 50;

    // qui istanziamo il contratto GLDToken
    beforeEach(async () => {
        // Get the ContractFactory and Signers here.
        Token = await ethers.getContractFactory("GLDToken");
        // Qua stiamo settando un paio di wallets, incluso l'owner wallet da usare nei test
        [owner, addr1, addr2] = await ethers.getSigners();
        // Qui stiamo deployando il contratto
        oceanToken = await Token.deploy(TOKEN_CAP, TOKEN_BLOCK_REWARD);
    });

    describe("Deployment", () => {
        // qui stiamo verificando che l'owner è colui che ha deployato il contratto
        it("Should set the right owner", async () => {
          expect(await oceanToken.owner()).to.equal(owner.address);
        });
    
        // qui ci stiamo assicurando che la total supply è uguale alla owner balance
        it("Should assign the total supply of tokens to the owner", async function () {
          const ownerBalance = await oceanToken.balanceOf(owner.address);
          expect(await oceanToken.totalSupply()).to.equal(ownerBalance);
        });
    
        it("Should set the max capped supply to the argument provided during deployment", async function () {
          const cap = await oceanToken.cap();
          expect(Number(formatEther(cap))).to.equal(TOKEN_CAP);
        });
    
        it("Should set the blockReward to the argument provided during deployment", async function () {
          const blockReward = await oceanToken.blockReward();
          expect(Number(formatEther(blockReward))).to.equal(TOKEN_BLOCK_REWARD);
        });
      });

      describe("Transactions", () => {
        it("Should transfer tokens between accounts", async () => {
          // Transfer 50 tokens from owner to addr1
          await oceanToken.transfer(addr1.address, 50);
          const addr1Balance = await oceanToken.balanceOf(addr1.address);
          expect(addr1Balance).to.equal(50);
    
          // Transfer 50 tokens from addr1 to addr2
          // We use .connect(signer) to send a transaction from another account
          await oceanToken.connect(addr1).transfer(addr2.address, 50);
          const addr2Balance = await oceanToken.balanceOf(addr2.address);
          expect(addr2Balance).to.equal(50);
        });
    
        it("Should fail if sender doesn't have enough tokens", async function () {
          const initialOwnerBalance = await oceanToken.balanceOf(owner.address);
          // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
          // `require` will evaluate false and revert the transaction.
          await expect(
            oceanToken.connect(addr1).transfer(owner.address, 1)
          ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    
          // Owner balance shouldn't have changed.
          expect(await oceanToken.balanceOf(owner.address)).to.equal(
            initialOwnerBalance
          );
        });
    
        // Questo test fa due transazioni una dopo l'altra e si assicura che le balance di entrambi
        // i wallet vengano aggiornate.
        it("Should update balances after transfers", async function () {
          const initialOwnerBalance: bigint = await oceanToken.balanceOf(owner.address);
    
          // Transfer 100 tokens from owner to addr1.
          await oceanToken.transfer(addr1.address, 100);
    
          // Transfer another 50 tokens from owner to addr2.
          await oceanToken.transfer(addr2.address, 50);
    
          // Check balances.
          const finalOwnerBalance = await oceanToken.balanceOf(owner.address);
          expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150n);
    
          const addr1Balance = await oceanToken.balanceOf(addr1.address);
          expect(addr1Balance).to.equal(100);
    
          const addr2Balance = await oceanToken.balanceOf(addr2.address);
          expect(addr2Balance).to.equal(50);
        });
      });
});