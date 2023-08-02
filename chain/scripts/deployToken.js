const hre = require("hardhat");
const contracts = require('../deployedContracts.json');
const fs = require('fs');

async function main() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // needed due to certificate restrictions on corporate PC
  const SecurityToken = await hre.ethers.getContractFactory("SecurityToken");
  const securityToken = await SecurityToken.deploy();

  await securityToken.deployed();

  console.log("SecurityToken deployed to:", securityToken.address);

  // Save deployed contract address to JSON file
  contracts.SecurityToken = securityToken.address;
  fs.writeFileSync('./deployedContracts.json', JSON.stringify(contracts));

  // Define accounts to be used
  const account1 = "0x6b15841452B63FEF248837dbF3012BEB5a0C97A5";
  const account2 = "0xa4703E892C41d6B85cBf16CDF80D5Dd5e22B45d1";

  // Add accounts to whitelist
  await securityToken.addToWhitelist(account1);
  console.log(`Added to whitelist: ${account1}`);

  await securityToken.addToWhitelist(account2);
  console.log(`Added to whitelist: ${account2}`);

  // Mint tokens with vesting schedule
  const amount = "1000000000000000000"; // 1 token in Wei (18 decimals)
  const vestingAmounts = ["500000000000000000", "500000000000000000"]; // 0.5 token each in Wei
  const vestingUnlockTimes = [1690535487, 1690708287]; // Unlock times in the past

  await securityToken.mint(account1, amount, vestingAmounts, vestingUnlockTimes);
  console.log(`Minted ${amount} tokens to ${account1} with vesting schedule.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// npx hardhat run scripts/deployToken.js --network sepolia
