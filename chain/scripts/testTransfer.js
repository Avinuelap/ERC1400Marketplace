const hre = require("hardhat");
const contracts = require('../deployedContracts.json');

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // needed due to certificate restrictions on corporate PC
    // Get SecurityToken contract instance
    const securityTokenAddress = contracts.SecurityToken;
    const SecurityToken = await hre.ethers.getContractFactory("SecurityToken");
    const securityToken = SecurityToken.attach(securityTokenAddress);

    // Define accounts to be used
    const account1 = "0x6b15841452B63FEF248837dbF3012BEB5a0C97A5";
    const account2 = "0xa4703E892C41d6B85cBf16CDF80D5Dd5e22B45d1";

    // Get price of token
    const price = await securityToken.getPrice();
    console.log(`Price of token: ${price}`);

    // Check unlocked balances before the transfer operation
    let unlockedBalance1 = await securityToken.getUnlockedBalanceOf(account1);
    let unlockedBalance2 = await securityToken.getUnlockedBalanceOf(account2);

    // Check erc20 balances after the transfer operation
    let erc20Balance1 = await securityToken.balanceOf(account1);
    let erc20Balance2 = await securityToken.balanceOf(account2);

    console.log(`Before update:`);
    console.log(`Unlocked balance of account1: ${unlockedBalance1}`);
    console.log(`Unlocked balance of account2: ${unlockedBalance2}`);
    console.log(`ERC20 balance of account1: ${erc20Balance1}`);
    console.log(`ERC20 balance of account2: ${erc20Balance2}`);

    return;
    const amountToTransfer = "100000000000000000"; // 0.1 token in Wei (18 decimals)
    await securityToken.transfer(account2, amountToTransfer);

    // Check unlocked balances after the transfer operation
    unlockedBalance1 = await securityToken.getUnlockedBalanceOf(account1);
    unlockedBalance2 = await securityToken.getUnlockedBalanceOf(account2);

    console.log(`After transfer operation:`);
    console.log(`Unlocked balance of account1: ${unlockedBalance1}`);
    console.log(`Unlocked balance of account2: ${unlockedBalance2}`);

    // Check erc20 balances after the transfer operation
    erc20Balance1 = await securityToken.balanceOf(account1);
    erc20Balance2 = await securityToken.balanceOf(account2);
    console.log(`ERC20 balance of account1: ${erc20Balance1}`);
    console.log(`ERC20 balance of account2: ${erc20Balance2}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run scripts/testTransfer.js --network sepolia