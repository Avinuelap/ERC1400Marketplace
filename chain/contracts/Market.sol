// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ISecurityToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Market is Ownable {
    struct RegisteredToken {
        address tokenAddress;
        string name;
        string symbol;
        string asset;
        string doc;
        bool active;
    }
    RegisteredToken[] private _registeredTokens;
    mapping(address => uint256) private _addressToIndex;

    IERC20 public usdt;

    struct Order {
        address trader;
        uint256 amount;
        uint256 totalValue;
        bool isBuyOrder;
        bool active; // Nuevo campo
    }

    struct OrderBook {
        Order[] buyOrders;
        Order[] sellOrders;
    }

    mapping(address => OrderBook) private _orderBooks;

    constructor(address _usdt) {
        usdt = IERC20(_usdt);
    }

    // Register new token. If released, this would need to include onlyOwner modifier
    // Registration of new tokens would then be done via a form on the website validated by an admin
    function registerToken(
        address _tokenAddress,
        string memory _name,
        string memory _symbol,
        string memory _asset,
        string memory _doc
    ) public onlyOwner {
        _registeredTokens.push(RegisteredToken(_tokenAddress, _name, _symbol, _asset, _doc, true));
        _addressToIndex[_tokenAddress] = _registeredTokens.length - 1;
    }

    // Unregister token
    function unregisterToken(address _tokenAddress) public onlyOwner {
        uint256 index = _addressToIndex[_tokenAddress];
        require(
            _registeredTokens[index].tokenAddress == _tokenAddress,
            "Token not registered"
        );
        _registeredTokens[index].active = false;
        delete _addressToIndex[_tokenAddress];
    }

    // Get registered tokens
    function getRegisteredTokens() public view returns (RegisteredToken[] memory) {
        return _registeredTokens;
    }

    function placeBuyOrder(
        uint256 _amount,
        uint256 _price,
        address _tokenAddress
    ) public {
        uint256 index = _addressToIndex[_tokenAddress];
        require(
            _registeredTokens[index].tokenAddress == _tokenAddress &&
                _registeredTokens[index].active,
            "Token not registered or not active"
        );

        uint256 totalValue = _price * (_amount / 1e18);

        require(
            usdt.balanceOf(msg.sender) >= totalValue,
            "Insufficient USDT balance"
        );

        usdt.transferFrom(msg.sender, address(this), totalValue);

        _orderBooks[_tokenAddress].buyOrders.push(
            Order(msg.sender, _amount, totalValue, true, true)
        );

        matchOrders(_tokenAddress);
    }

    function placeSellOrder(
        uint256 _amount,
        uint256 _price,
        address _tokenAddress
    ) public {
        ISecurityToken token = ISecurityToken(_tokenAddress);
        uint256 totalValue = _price * (_amount / 1e18) ;

        require(
            token.balanceOf(msg.sender) >= _amount,
            "Insufficient Security Token balance"
        );

        token.transferFrom(msg.sender, address(this), _amount);

        _orderBooks[_tokenAddress].sellOrders.push(
            Order(msg.sender, _amount, totalValue, false, true)
        );

        matchOrders(_tokenAddress);
    }

    function matchOrders(address _tokenAddress) private {
    Order[] storage buyOrders = _orderBooks[_tokenAddress].buyOrders;
    Order[] storage sellOrders = _orderBooks[_tokenAddress].sellOrders;

    for (uint i = 0; i < buyOrders.length; i++) {
        if (!buyOrders[i].active) continue;

        for (uint j = 0; j < sellOrders.length; j++) {
            if (!sellOrders[j].active) continue;

            Order storage buyOrder = buyOrders[i];
            Order storage sellOrder = sellOrders[j];

            if (buyOrder.totalValue >= sellOrder.totalValue) {
                ISecurityToken token = ISecurityToken(_tokenAddress);
                uint256 tradeAmount = (buyOrder.amount < sellOrder.amount)
                    ? buyOrder.amount
                    : sellOrder.amount;
                uint256 tradeValue = (buyOrder.totalValue < sellOrder.totalValue)
                    ? buyOrder.totalValue
                    : sellOrder.totalValue;

                token.transfer(buyOrder.trader, tradeAmount);
                usdt.transfer(sellOrder.trader, tradeValue);

                buyOrder.amount -= tradeAmount;
                sellOrder.amount -= tradeAmount;
                buyOrder.totalValue -= tradeValue;
                sellOrder.totalValue -= tradeValue;

                if (buyOrder.amount == 0 || buyOrder.totalValue == 0) {
                    buyOrder.active = false;
                }

                if (sellOrder.amount == 0 || sellOrder.totalValue == 0) {
                    sellOrder.active = false;
                }

                // Si alguna de las órdenes ya no está activa, salir del bucle
                if (!buyOrder.active || !sellOrder.active) break;
            }
        }
    }
}


    function removeBuyOrder(uint256 index, address _tokenAddress) public {
        require(
            index < _orderBooks[_tokenAddress].buyOrders.length,
            "Index out of bounds"
        );
        _orderBooks[_tokenAddress].buyOrders[index].active = false;
    }

    function removeSellOrder(uint256 index, address _tokenAddress) public {
        require(
            index < _orderBooks[_tokenAddress].sellOrders.length,
            "Index out of bounds"
        );
        _orderBooks[_tokenAddress].sellOrders[index].active = false;
    }

    function getFullOrderBook(address _tokenAddress)
        public
        view
        returns (Order[] memory, Order[] memory)
    {
        return (
            _orderBooks[_tokenAddress].buyOrders,
            _orderBooks[_tokenAddress].sellOrders
        );
    }

    function getBuyOrders(address _tokenAddress) public view returns (Order[] memory) {
        return _orderBooks[_tokenAddress].buyOrders;
    }

    function getSellOrders(address _tokenAddress) public view returns (Order[] memory) {
        return _orderBooks[_tokenAddress].sellOrders;
    }
}
