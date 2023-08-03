const hre = require("hardhat");
const contracts = require('../deployedContracts.json');
const fs = require('fs');

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // needed due to certificate restrictions on corporate PC
    const USDT = await hre.ethers.getContractFactory("USDT");
    const usdt = await USDT.deploy();
    await usdt.deployed();
    console.log("USDT deployed to:", usdt.address);

    contracts.USDT = usdt.address;
    fs.writeFileSync('./deployedContracts.json', JSON.stringify(contracts, null, 4));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// npx hardhat run scripts/deployUSDT.js --network sepolia