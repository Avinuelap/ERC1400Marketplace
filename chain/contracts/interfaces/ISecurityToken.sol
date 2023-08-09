// SPDX-License-Identifier: CC-BY-NC-ND-2.5
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISecurityToken is IERC20 {
    struct VestingEntry {
        uint256 unlockTime;
        uint256 amount;
    }

    // Token transfers
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    //function balanceOf(address account) external view returns (uint256);

    // Pegged Asset
    function getAssetId() external view returns (string memory);

    // Whitelists and blacklists
    function addToBlacklist(address account) external;
    function removeFromBlacklist(address account) external;

    // Partitions and Vesting Periods
    function mint(
        address account,
        uint256 amount,
        uint256[] memory vestingAmounts,
        uint256[] memory vestingUnlockTimes
    ) external;
    function updateUnlockedBalance(address account) external;
    function getNumberOfPartitions() external view returns (uint256);
    function getNumberOfPartitionsOf(address tokenHolder) external view returns (uint256);
    function getVestingScheduleOf(address tokenHolder) external view returns (VestingEntry[] memory);
    function getUnlockedBalance() external view returns (uint256);
    function getUnlockedBalanceOf(address tokenHolder) external view returns (uint256);

    // Document Management
    function attachDocument(string memory _name, string memory _uri) external;
    function totalDocuments() external view returns (uint256);
    function getDocument(uint256 index) external view returns (string memory, string memory);
    function removeDocument(uint256 index) external;
    function updateDocument(uint256 index, string memory _name, string memory _uri) external;

    // Events
    event DocumentAttached(string indexed name, string uri);
}
