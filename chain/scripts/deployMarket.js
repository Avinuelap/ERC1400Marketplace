const hre = require("hardhat");
const contracts = require('../deployedContracts.json');
const fs = require('fs');

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // needed due to certificate restrictions on corporate PC
    const Market = await hre.ethers.getContractFactory("Market");
    const market = await Market.deploy(contracts.USDT);
    await market.deployed();
    console.log("Market deployed to:", market.address);

    contracts.Market = market.address;
    fs.writeFileSync('./deployedContracts.json', JSON.stringify(contracts, null, 4));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// npx hardhat run scripts/deployMarket.js --network sepolia
