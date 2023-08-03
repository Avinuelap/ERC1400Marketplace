// SPDX-License-Identifier: CC-BY-NC-ND-2.5

pragma solidity ^0.8.7;
/// @title USDT
/// @author AVinuela, MBernal
/// @notice Simulación de USDT en Sepolia 
/// @dev No existe USDT oficial en Sepolia, por lo que se crea una simulacion de USDT para poder realizar las pruebas de la aplicación

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract USDT is ERC20, Ownable {
    constructor() ERC20("USDT", "USDT") {
        _mint(msg.sender, 500e18);
    }

    function showDeployer() public view returns (address) {
        return owner();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}