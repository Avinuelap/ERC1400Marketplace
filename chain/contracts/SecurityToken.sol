pragma solidity ^0.8.7;

/// @title Security Token
/// @author Avinuela👑
/// @notice Basic security token implementation, expanding ERC20
/// @dev This contract is a basic implementation of a Security Token, expanding ERC20 and following ERC1400 requirements:
/*
- Whitelists and Blacklists:
To comply with regulations, security token issuers often maintain whitelists of Ethereum addresses that are authorized to hold the token. This allows control over who can buy, sell, and receive the token.

- Partitions:
The concept of partitions is introduced to represent different classes of shares or different states of the token (for example, locked versus transferable).

- Token Lockup and Vesting Periods:
Security tokens have lockup periods during which they cannot be sold or transferred. This is a common mechanism in private token sales to ensure that investors do not immediately sell their tokens on the market.

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
    // ********************* VARIABLES, EVENTS AND MODIFIERS *********************
    // **** 1. Whitelists and blacklists ****
    // Whitelist of addresses authorized to hold tokens
    mapping(address => bool) private _whitelist;
    // Blacklist of addresses not authorized to hold tokens
    mapping(address => bool) private _blacklist;
    // Modifier to check if an address is on the whitelist
    modifier isWhitelisted(address account) {
        require(_whitelist[account], "SecurityToken: account not whitelisted");
        _;
    }
    // Modifier to check if an address is on the blacklist
    modifier isNotBlacklisted(address account) {
        require(!_blacklist[account], "SecurityToken: account is blacklisted");
        _;
    }

    // **** 2. Partitions ****
    // Vesting schedules structure to store moments in time when tokens are unlocked, as well as the amount of tokens unlocked at that moment
    struct VestingEntry {
        uint256 unlockTime;
        uint256 amount;
    }
    // Number of partitions for each address
    mapping(address => uint256) private _partitions;

    // **** 3. Token lockup and vesting periods ****
    // Balance of unlocked tokens by address
    mapping(address => uint256) private _unlockedBalance;
    // Maps each address with its array of vesting schedule
    mapping(address => VestingEntry[]) private _vestingSchedules;

    // **** 4. Document Management ****
    struct Document {
        string name;
        string uri; // Location of the document, like HTTP(S) or IPFS
        bool deleted; // Flag to indicate if the document has been deleted
    }
    // Documents attached to the token
    Document[] public documents;

    // Event emitted when a document is attached
    event DocumentAttached(string indexed name, string uri);

    // **** 5. Controller and Operators ****
    // Managed by the Managed contract

    // ********************* CONSTRUCTOR *********************
    constructor() ERC20("UC3MSecurityToken", "3MST") {}

    // ********************* FUNCTIONS *********************
    // **** 1. Whitelists and blacklists ****
    // Allow manager to add an address to the whitelist
    function addToWhitelist(address account) public onlyManager {
        _whitelist[account] = true;
    }

    // Allow mamager to remove an address from the whitelist
    function removeFromWhitelist(address account) public onlyManager {
        _whitelist[account] = false;
    }

    // Allow manager to add an address to the blacklist
    function addToBlacklist(address account) public onlyManager {
        _blacklist[account] = true;
    }

    // Allow manager to remove an address from the blacklist
    function removeFromBlacklist(address account) public onlyManager {
        _blacklist[account] = false;
    }

    // **** 2. Partitions ****
    // **** 3. Token lockup and vesting periods ****
    // Modify mint function to allow minting of tokens with vesting schedules,
    // taking an array of vesting amounts and an array of vesting unlock times
    function mint(
        address account,
        uint256 amount,
        uint256[] memory vestingAmounts,
        uint256[] memory vestingUnlockTimes
    ) public onlyManager {
        require(
            vestingAmounts.length == vestingUnlockTimes.length,
            "SecurityToken: vesting arrays must have the same length"
        );
        // Make sure vesting amounts sum up to the total amount
        uint256 totalVestingAmount = 0;
        for (uint256 i = 0; i < vestingAmounts.length; i++) {
            totalVestingAmount += vestingAmounts[i];
        }
        require(
            amount == totalVestingAmount,
            "SecurityToken: total vesting amount must equal total mint amount"
        );
        // Call ERC20's mint function
        _mint(account, amount);
        // Add vesting entries
        for (uint256 i = 0; i < vestingAmounts.length; i++) {
            VestingEntry memory newEntry = VestingEntry({
                amount: vestingAmounts[i],
                unlockTime: vestingUnlockTimes[i]
            });
            _vestingSchedules[account].push(newEntry);
        }
    }

    // Unlocks any vested tokens that have vested up to the current time. This will be called when transferring tokens or when getting the unlocked balance of an address
    function updateUnlockedBalance(address account) private {
        VestingEntry[] storage schedule = _vestingSchedules[account];
        for (uint256 i = 0; i < schedule.length; i++) {
            if (block.timestamp >= schedule[i].unlockTime) {
                _unlockedBalance[account] += schedule[i].amount;
                // Replace the element we just processed with the last in the list, then delete the last
                schedule[i] = schedule[schedule.length - 1];
                schedule.pop();
                // As we have modified the list while iterating over it, we need to step back the index to correctly process the next element
                i--;
            } else {
                // Since the list is ordered by time, we can end the loop as soon as we find an element that is not yet unlocked
                break;
            }
        }
    }

    // Modify transfer function to allow transfer of unlocked tokens only
    function transfer(
        address to,
        uint256 amount
    )
        public
        override
        isWhitelisted(to)
        isNotBlacklisted(to)
        returns (bool)
    {
        // Update unlocked balance before transfer
        updateUnlockedBalance(_msgSender());
        // Check if the sender has enough unlocked tokens
        require(
            _unlockedBalance[_msgSender()] >= amount,
            "SecurityToken: transfer amount exceeds unlocked balance"
        );
        // Call ERC20's transfer function
        _transfer(_msgSender(), to, amount);
        // If successful, Substract the amount from the unlocked balance
        _unlockedBalance[_msgSender()] -= amount;

        return true;
    }

    // Modify transferFrom function to allow transfer of unlocked tokens only
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override isWhitelisted(to) isWhitelisted(from) isNotBlacklisted(to) isNotBlacklisted(from) returns (bool) {
        // Update unlocked balance before transfer
        updateUnlockedBalance(from);
        // Check if the sender has enough unlocked tokens
        require(
            _unlockedBalance[from] >= amount,
            "SecurityToken: transfer amount exceeds unlocked balance"
        );
        // Check allowance
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        // Call ERC20's transfer function
        _transfer(from, to, amount);
        // If successful, substract the transferred amount from the unlocked balance
        _unlockedBalance[from] -= amount;
        return true;
    }

    // Get number of partitions of sender adress
    function getNumberOfPartitions() public view returns (uint256) {
        return _partitions[_msgSender()];
    }
    // Get number of partitions of a given address
    function getNumberOfPartitionsOf(address tokenHolder) public view returns (uint256) {
        return _partitions[tokenHolder];
    }

    // **** 4. Document Management ****
    // Method to attach a document to the token
    function attachDocument(
        string memory _name,
        string memory _uri
    ) public onlyManager {
        Document memory newDoc = Document({name: _name, uri: _uri});
        documents.push(newDoc);
        emit DocumentAttached(_name, _uri);
    }

    // Method to get the number of documents attached to the token
    function totalDocuments() public view returns (uint256) {
        return documents.length;
    }

    // Method to get the name and URI of a document
    function getDocument(
        uint256 index
    ) public view returns (string memory, string memory) {
        return (documents[index].name, documents[index].uri);
    }

    // Method to remove a document from the token
    function removeDocument(uint256 index) public onlyManager {
        delete documents[index];
    }

    // Method to update the name or URI of a document
    function updateDocument(
        uint256 index,
        string memory _name,
        string memory _uri
    ) public onlyManager {
        documents[index].name = _name;
        documents[index].uri = _uri;
    }
}
