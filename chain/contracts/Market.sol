// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ISecurityToken.sol";

contract Market {
    IERC20 public usdt;

    struct Order {
        address trader;
        uint256 amount;
        uint256 totalValue;
        bool isBuyOrder;
    }

    struct OrderBook {
        Order[] buyOrders;
        Order[] sellOrders;
    }
    
    mapping(address => OrderBook) private _orderBooks;

    constructor(address _usdt) {
        usdt = IERC20(_usdt);
    }

    function placeBuyOrder(uint256 _amount, uint256 _price, address _tokenAddress) public {
        uint256 totalValue = _price * _amount;

        // Ensure trader has enough USDT
        require(usdt.balanceOf(msg.sender) >= totalValue, "Insufficient USDT balance");

        // Transfer USDT from trader
        usdt.transferFrom(msg.sender, address(this), totalValue);

        // Add order
        _orderBooks[_tokenAddress].buyOrders.push(Order(msg.sender, _amount, totalValue, true));

        // Match new order
        matchOrders(_tokenAddress);
    }

    function placeSellOrder(uint256 _amount, uint256 _price, address _tokenAddress) public {
        ISecurityToken token = ISecurityToken(_tokenAddress);
        
        uint256 totalValue = _price * _amount;

        // Ensure trader has enough Security Tokens
        require(token.balanceOf(msg.sender) >= _amount, "Insufficient Security Token balance");

        // Transfer Security Tokens from trader
        token.transferFrom(msg.sender, address(this), _amount);

        // Add order
        _orderBooks[_tokenAddress].sellOrders.push(Order(msg.sender, _amount, totalValue, false));

        // Match new order
        matchOrders(_tokenAddress);
    }

    function matchOrders(address _tokenAddress) private {
        // Check if there's at least one buy and sell order
        if (_orderBooks[_tokenAddress].buyOrders.length > 0 && _orderBooks[_tokenAddress].sellOrders.length > 0) {
            // Get the first buy and sell orders
            Order storage buyOrder = _orderBooks[_tokenAddress].buyOrders[0];
            Order storage sellOrder = _orderBooks[_tokenAddress].sellOrders[0];

            // Check if the first buy order price is higher or equal to the first sell order price
            if (buyOrder.totalValue >= sellOrder.totalValue) {
                ISecurityToken token = ISecurityToken(_tokenAddress);
                // Get the amount to trade
                uint256 tradeAmount = (buyOrder.amount < sellOrder.amount) ? buyOrder.amount : sellOrder.amount;
                uint256 tradeValue = (buyOrder.totalValue < sellOrder.totalValue) ? buyOrder.totalValue : sellOrder.totalValue;

                // Transfer Security Tokens from seller to buyer
                token.transfer(buyOrder.trader, tradeAmount);

                // Transfer USDT from this contract to seller
                usdt.transfer(sellOrder.trader, tradeValue);

                // Update orders
                buyOrder.amount -= tradeAmount;
                sellOrder.amount -= tradeAmount;
                buyOrder.totalValue -= tradeValue;
                sellOrder.totalValue -= tradeValue;

                // Remove order if the amount is 0
                if (buyOrder.amount == 0) {
                    removeBuyOrder(0, _tokenAddress);
                }

                if (sellOrder.amount == 0) {
                    removeSellOrder(0, _tokenAddress);
                }
            }
        }
    }

    function removeBuyOrder(uint256 index, address _tokenAddress) public {
        require(index < _orderBooks[_tokenAddress].buyOrders.length, "Index out of bounds");

        // Shift down orders from index
        for (uint i = index; i < _orderBooks[_tokenAddress].buyOrders.length - 1; i++) {
            _orderBooks[_tokenAddress].buyOrders[i] = _orderBooks[_tokenAddress].buyOrders[i + 1];
        }
        _orderBooks[_tokenAddress].buyOrders.pop(); // remove the last element
    }

    function removeSellOrder(uint256 index, address _tokenAddress) public {
        require(index < _orderBooks[_tokenAddress].sellOrders.length, "Index out of bounds");

        // Shift down orders from index
        for (uint i = index; i < _orderBooks[_tokenAddress].sellOrders.length - 1; i++) {
            _orderBooks[_tokenAddress].sellOrders[i] = _orderBooks[_tokenAddress].sellOrders[i + 1];
        }
        _orderBooks[_tokenAddress].sellOrders.pop(); // remove the last element
    }

    function getFullOrderBook(address _tokenAddress) public view returns (Order[] memory, Order[] memory) {
        return (_orderBooks[_tokenAddress].buyOrders, _orderBooks[_tokenAddress].sellOrders);
    }
    function getBuyOrders(address _tokenAddress) public view returns (Order[] memory) {
        return _orderBooks[_tokenAddress].buyOrders;
    }
    function getSellOrders(address _tokenAddress) public view returns (Order[] memory) {
        return _orderBooks[_tokenAddress].sellOrders;
    }
}