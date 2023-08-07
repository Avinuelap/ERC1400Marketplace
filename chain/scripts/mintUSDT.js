const hre = require("hardhat");
const ethers = require('ethers');

const contracts = require('../deployedContracts.json');

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // needed due to certificate restrictions on corporate PC

    // Get USDT contract instance
    const usdtAddress = contracts.USDT;
    const USDT = await hre.ethers.getContractFactory("USDT");
    const usdt = USDT.attach(usdtAddress);

    // Mint USDT
    address = "0xa4703E892C41d6B85cBf16CDF80D5Dd5e22B45d1";
    const amount = ethers.utils.parseUnits('400', '18');

    const tx = await usdt.mint(address, amount);
    await tx.wait();
    console.log("Minted USDT to:", address);
    console.log("Amount:", amount / 1e18);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run scripts/mintUSDT.js --network sepolia