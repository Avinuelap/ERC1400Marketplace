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
    /*
    address = "0xa4703E892C41d6B85cBf16CDF80D5Dd5e22B45d1";
    const amount = ethers.utils.parseUnits('400', '18');

    const tx = await usdt.mint(address, amount);
    await tx.wait();
    console.log("Minted USDT to:", address);
    console.log("Amount:", amount / 1e18);
    */
    // Check allowances
    const owner = "0x6b15841452B63FEF248837dbF3012BEB5a0C97A5";
    const spender = "0x5293BCe8764D5e400511eD91fe93aDBcDEAf8ecb"
    const allowance = await usdt.allowance(owner, spender)
    console.log(`Allowance for ${spender} in name of ${owner}: ${allowance}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run scripts/mintUSDT.js --network sepolia