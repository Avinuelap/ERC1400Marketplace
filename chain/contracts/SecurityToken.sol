pragma solidity ^0.8.7;

/// @title Security Token
/// @author Avinuela👑
/// @notice Basic security token implementation, expanding ERC20
/// @dev This contract is a basic implementation of a Security Token, expanding ERC20 and following ERC1400 requirements:
/*
- Whitelists and Blacklists:
To comply with regulations, security token issuers often maintain whitelists of Ethereum addresses that are authorized to hold the token. This allows control over who can buy, sell, and receive the token.

- Token Lockup and Vesting Periods:
Security tokens have lockup periods during which they cannot be sold or transferred. This is a common mechanism in private token sales to ensure that investors do not immediately sell their tokens on the market.

- Partitions:
The concept of partitions is introduced to represent different classes of shares or different states of the token (for example, locked versus transferable).

- Document Management:
The ability to attach information and documents to token transactions, which can be useful for complying with reporting requirements.

- Controller and Operators:
Controllers and operators are entities that have special permissions to manage the token, such as forcing transfers or freezing an address.
*/

// SPDX-License-Identifier: CC-BY-NC-ND-2.5

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils/Managed.sol";

// Inheriting from OpenZeppelin's ERC20 and Ownable to provide basic token features and ownership control
contract SecurityToken is ERC20, Managed {
    // ********************* VARIABLES AND EVENTS *********************
    // **** Whitelists and blacklists ****
    // Whitelist of addresses authorized to hold tokens
    mapping (address => bool) private _whitelist;
    // Blacklist of addresses not authorized to hold tokens
    mapping (address => bool) private _blacklist;

    // **** Token lockup and vesting periods ****

    // Date until which tokens of an address are locked
    mapping (address => uint256) private _lockupTimestamp;

    // Balances of different partitions by address
    mapping (address => mapping (uint256 => uint256)) private _partitionBalances;

    // Number of partitions for each address
    mapping (address => uint256) private _partitions;

    // **** Document Management ****
    struct Document {
        string name;
        string uri; // Location of the document, like HTTP(S) or IPFS
    }
    // Documents attached to the token
    Document[] public documents;

    // Event emitted when a document is attached
    event DocumentAttached(string indexed name, string uri);

    constructor() ERC20("UC3MSecurityToken", "3MST") {}

    // ********************* FUNCTIONS *********************
    // **** Whitelists and blacklists ****
    // Allow owner to add an address to the whitelist
    function addToWhitelist(address account) public onlyManager {
        _whitelist[account] = true;
    }

    // Allow owner to remove an address from the whitelist
    function removeFromWhitelist(address account) public onlyManager {
        _whitelist[account] = false;
    }

    // Allow owner to add an address to the blacklist
    function addToBlacklist(address account) public onlyManager {
        _blacklist[account] = true;
    }

    // Allow owner to remove an address from the blacklist
    function removeFromBlacklist(address account) public onlyManager {
        _blacklist[account] = false;
    }

    // **** Token lockup and vesting periods ****
    // Owner can set a lockup release date for an address's tokens
    function setLockup(address account, uint256 releaseTime) public onlyManager {
        _lockupTimestamp[account] = releaseTime;
    }

    // Owner can mint new tokens to an address on the whitelist
    function mint(address account, uint256 amount) public onlyManager {
        _mint(account, amount);
    }

    // Before minting tokens, we check that the address is on the whitelist
    function _mint(address account, uint256 amount) internal override {
        require(_whitelist[account], "SecurityToken: account not whitelisted");
        super._mint(account, amount);
    }

    // When transferring tokens, we need to check that both the sender and the recipient are on the whitelist,
    // and we are not in a lockup period.
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        require(_whitelist[recipient], "SecurityToken: recipient not whitelisted");
        require(block.timestamp >= _lockupTimestamp[_msgSender()], "SecurityToken: tokens are locked");
        super.transfer(recipient, amount);
    }

    // The same applies to transferFrom
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        require(_whitelist[sender] && _whitelist[recipient], "SecurityToken: sender or recipient not whitelisted");
        require(block.timestamp >= _lockupTimestamp[sender], "SecurityToken: tokens are locked");
        super.transferFrom(sender, recipient, amount);
    }

    // Method to know the total partitions of a token holder
    function totalPartitions() public view returns (uint256) {
        return _partitions[_msgSender()];
    }

    // Method to know the balance of a specific partition of a token holder
    function partitionBalance(uint256 partition) public view returns (uint256) {
        return _partitionBalances[_msgSender()][partition];
    }

    // Method to transfer tokens from a specific partition to another token holder on the whitelist
    function transferPartition(uint256 partition, address to, uint256 amount) public returns (bool) {
        require(_whitelist[to], "SecurityToken: recipient not whitelisted");
        require(_partitionBalances[_msgSender()][partition] >= amount, "SecurityToken: insufficient balance for this partition");
        _partitionBalances[_msgSender()][partition] -= amount;
        _partitionBalances[to][partition] += amount;
        emit Transfer(_msgSender(), to, amount);
        return true;
    }
    // **** Document Management ****
    // Method to attach a document to the token
    function attachDocument(string memory _name, string memory _uri) public onlyManager {
        Document memory newDoc = Document({
            name: _name,
            uri: _uri
        });
        documents.push(newDoc);
        emit DocumentAttached(_name, _uri);
    }

    // Method to get the number of documents attached to the token
    function totalDocuments() public view returns (uint256) {
        return documents.length;
    }

    // Method to get the name and URI of a document
    function getDocument(uint256 index) public view returns (string memory, string memory) {
        return (documents[index].name, documents[index].uri);
    }

    // Method to remove a document from the token
    function removeDocument(uint256 index) public onlyManager {
        delete documents[index];
    }

    // Method to update the name or URI of a document
    function updateDocument(uint256 index, string memory _name, string memory _uri) public onlyManager {
        documents[index].name = _name;
        documents[index].uri = _uri;
    }

}