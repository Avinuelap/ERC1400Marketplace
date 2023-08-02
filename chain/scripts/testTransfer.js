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

    // Check unlocked balances before the transfer operation
    let unlockedBalance1 = await securityToken.getUnlockedBalanceOf(account1);
    let unlockedBalance2 = await securityToken.getUnlockedBalanceOf(account2);

    console.log(`Before update:`);
    console.log(`Unlocked balance of account1: ${unlockedBalance1}`);
    console.log(`Unlocked balance of account2: ${unlockedBalance2}`);

    await securityToken.updateUnlockedBalance(account1);
    await securityToken.updateUnlockedBalance(account2);

    // Check unlocked balances after the transfer operation
    unlockedBalance1 = await securityToken.getUnlockedBalanceOf(account1);
    unlockedBalance2 = await securityToken.getUnlockedBalanceOf(account2);

    console.log(`After update:`);
    console.log(`Unlocked balance of account1: ${unlockedBalance1}`);
    console.log(`Unlocked balance of account2: ${unlockedBalance2}`);
    // Perform a transfer operation from account1 to account2
    /*
    const amountToTransfer = "100000000000000000"; // 0.1 token in Wei (18 decimals)
    await securityToken.connect(account1).transfer(account2, amountToTransfer);

    // Check unlocked balances after the transfer operation
    unlockedBalance1 = await securityToken.unlockedBalance(account1);
    unlockedBalance2 = await securityToken.unlockedBalance(account2);

    console.log(`After transfer operation:`);
    console.log(`Unlocked balance of account1: ${unlockedBalance1}`);
    console.log(`Unlocked balance of account2: ${unlockedBalance2}`);
    */
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
