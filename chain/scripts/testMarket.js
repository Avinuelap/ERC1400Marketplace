const hre = require("hardhat");
const contracts = require('../deployedContracts.json');

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // needed due to certificate restrictions on corporate PC

    // Get the signers
    const [signer1, signer2] = await hre.ethers.getSigners();

    // Get Market contract instance
    const marketAddress = contracts.Market;
    const Market = await hre.ethers.getContractFactory("Market");
    const market = Market.attach(marketAddress);

    // Get USDT contract instance
    const usdtAddress = contracts.USDT; // replace this with your USDT contract address
    const ERC20 = await hre.ethers.getContractFactory("ERC20");
    const usdt = ERC20.attach(usdtAddress);

    // Get SecurityToken contract instance
    const tokenAddress = contracts.SecurityToken;
    const SecurityToken = await hre.ethers.getContractFactory("SecurityToken");
    const securityToken = SecurityToken.attach(tokenAddress);

    // Test market contract functions:

    // Place buy order
    const buyPrice = ethers.utils.parseUnits('1', '18');
    const buyAmount = 2;

    // Approve USDT transfer
    const totalBuyValue = buyPrice.mul(buyAmount);
    await usdt.connect(signer1).approve(marketAddress, totalBuyValue);

    const tx = await market.placeBuyOrder(buyAmount, buyPrice, tokenAddress);
    await tx.wait();
    console.log("Placed buy order:");
    const buyOrders = await market.getBuyOrders(tokenAddress);
    console.log(buyOrders);

    // Place sell order
    const sellPrice = ethers.utils.parseUnits('1.1', '18');
    const sellAmount = 2;

    // Approve SecurityToken transfer
    await securityToken.connect(signer1).approve(marketAddress, sellAmount);

    const tx2 = await market.placeSellOrder(sellAmount, sellPrice, tokenAddress);
    await tx2.wait();
    console.log("Placed sell order:");
    const sellOrders = await market.getSellOrders(tokenAddress);
    console.log(sellOrders);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }
);

// npx hardhat run scripts/testMarket.js --network sepolia
