const hre = require("hardhat");
const ethers = require('ethers');
const contracts = require('../deployedContracts.json');
const fs = require('fs');

async function main() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // needed due to certificate restrictions on corporate PC
  const SecurityToken = await hre.ethers.getContractFactory("SecurityToken");

  // Deploy SecurityToken contract
  const nombre = "Tesla Peg Token";
  const simbolo = "PTSL";
  const activo = "TSLA";
  const docURI = "https://www.tesla.com/"
  const securityToken = await SecurityToken.deploy(nombre, simbolo, activo, docURI);

  await securityToken.deployed();

  console.log("SecurityToken deployed to:", securityToken.address);

  // Save deployed contract address to JSON file
  contracts.SecurityToken = securityToken.address;
  fs.writeFileSync('./deployedContracts.json', JSON.stringify(contracts));

  // Define accounts to be used
  const account1 = "0x6b15841452B63FEF248837dbF3012BEB5a0C97A5";
  const account2 = "0xa4703E892C41d6B85cBf16CDF80D5Dd5e22B45d1";
  /*
  // Mint tokens with vesting schedule
  const amount = "1000000000000000000"; // 1 token in Wei (18 decimals)
  const vestingAmounts = ["500000000000000000", "500000000000000000"]; // 0.5 token each in Wei
  // Unlock dates
  const date1 = new Date("2023-08-01").getTime() / 1000;
  const date2 = new Date("2023-09-01").getTime() / 1000;

  const vestingUnlockTimes = [date1, date2]; // Unlock times in the past

  await securityToken.mint(account1, amount, vestingAmounts, vestingUnlockTimes);
  console.log(`Minted ${amount/1e18} tokens to ${account1} with vesting schedule.`);
  */
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// npx hardhat run scripts/deploySecurityToken.js --network sepolia
