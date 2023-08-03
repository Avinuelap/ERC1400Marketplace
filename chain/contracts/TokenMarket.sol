// SPDX-License-Identifier: CC-BY-NC-ND-2.5

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SecurityToken.sol";

contract TokenMarket is Ownable {
    // Map from token address to whether it is listed in the market
    mapping(address => bool) public isTokenListed;

    // List a new token to the market
    function listToken(address tokenAddress) public onlyOwner {
        isTokenListed[tokenAddress] = true;
    }

    // Remove a token from the market
    function unlistToken(address tokenAddress) public onlyOwner {
        isTokenListed[tokenAddress] = false;
    }

    // Buy tokens
    function buyTokens(address tokenAddress, uint256 tokenAmount) public payable {
        require(isTokenListed[tokenAddress], "TokenMarket: Token is not listed");
        SecurityToken token = SecurityToken(tokenAddress);

        uint256 tokenPrice = token.getPrice();
        uint256 cost = tokenPrice * tokenAmount;

        require(msg.value >= cost, "TokenMarket: Not enough Ether provided");

        // Ensure the market contract has enough tokens to sell
        require(token.balanceOf(address(this)) >= tokenAmount, "TokenMarket: Not enough tokens in reserve");

        // Transfer the tokens to the buyer
        token.transfer(msg.sender, tokenAmount);

        // Return any excess Ether sent
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
    }

    // Sell tokens
    function sellTokens(address tokenAddress, uint256 tokenAmount) public {
        require(isTokenListed[tokenAddress], "TokenMarket: Token is not listed");
        SecurityToken token = SecurityToken(tokenAddress);

        uint256 tokenPrice = token.getPrice();
        uint256 cost = tokenPrice * tokenAmount;

        // Ensure the seller has enough tokens to sell
        require(token.balanceOf(msg.sender) >= tokenAmount, "TokenMarket: Not enough tokens to sell");

        // Ensure the market contract has enough Ether to pay for the tokens
        require(address(this).balance >= cost, "TokenMarket: Not enough Ether in reserve");

        // Transfer the tokens from the seller to the market
        token.transferFrom(msg.sender, address(this), tokenAmount);

        // Pay the seller
        payable(msg.sender).transfer(cost);
    }
}
