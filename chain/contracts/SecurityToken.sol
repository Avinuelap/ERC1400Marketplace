pragma solidity ^0.8.7;

/// @title Security Token
/// @author Avinuela👑
/// @notice Basic security token implementation, expanding ERC20
/// @dev This contract is a basic implementation of a Security Token, expanding ERC20 and following ERC1400 requirements:

// SPDX-License-Identifier: CC-BY-NC-ND-2.5

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils/Managed.sol";

// Inheriting from OpenZeppelin's ERC20 and Ownable to provide basic token features and ownership control
contract SecurityToken is ERC20, Managed {
    // ********************* VARIABLES, EVENTS AND MODIFIERS *********************
    // **** 1. Whitelists and blacklists ****
    // Whitelist of addresses authorized to hold tokens
    mapping(address => bool) public whitelist;
    // Blacklist of addresses not authorized to hold tokens
    mapping(address => bool) public blacklist;
    // Modifier to check if an address is on the whitelist
    modifier isWhitelisted(address account) {
        require(whitelist[account], "SecurityToken: account not whitelisted");
        _;
    }
    // Modifier to check if an address is on the blacklist
    modifier isNotBlacklisted(address account) {
        require(!blacklist[account], "SecurityToken: account is blacklisted");
        _;
    }

    // **** 2. Partitions ****
    // Limit for VestingEntry count per account. Needed to avoid gas limit errors
    uint256 public constant MAX_VESTING_ENTRIES = 5;
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
    // Maps each address with its array of vesting schedules
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
    // 18 decimals by default
    constructor() ERC20("UC3MSecurityToken", "SECT") {}

    // ********************* FUNCTIONS *********************
    // **** 1. Whitelists and blacklists ****
    // Allow manager to add an address to the whitelist
    function addToWhitelist(address account) public onlyManager {
        whitelist[account] = true;
    }

    // Allow mamager to remove an address from the whitelist
    function removeFromWhitelist(address account) public onlyManager {
        whitelist[account] = false;
    }

    // Allow manager to add an address to the blacklist
    function addToBlacklist(address account) public onlyManager {
        blacklist[account] = true;
    }

    // Allow manager to remove an address from the blacklist
    function removeFromBlacklist(address account) public onlyManager {
        blacklist[account] = false;
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
            _vestingSchedules[account].length + vestingAmounts.length <=
                MAX_VESTING_ENTRIES,
            "SecurityToken: exceeded maximum number of vesting entries"
        );
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
        _partitions[account] = vestingAmounts.length;
        // Update unlocked balance
        updateUnlockedBalance(account);
    }

    // Unlocks any vested tokens that have vested up to the current time. This will be called when transferring tokens or when getting the unlocked balance of an address
    /*function updateUnlockedBalance(address account) private {
        for (uint256 i = 0; i < _vestingSchedules[account].length && i < 2; i++) {
            VestingEntry storage entry = _vestingSchedules[account][i];
            if (block.timestamp >= entry.unlockTime) {
                _unlockedBalance[account] += entry.amount;
                // Move the last entry to this slot and then delete the last slot
                _vestingSchedules[account][i] = _vestingSchedules[account][
                    _vestingSchedules[account].length - 1
                ];
                _vestingSchedules[account].pop();
                // Go back one step in order to process the entry that we have just swapped
                i--;
            } else {
                // Since the list is ordered by time, we can break the loop as soon as we find an element that is not yet unlocked
                break;
            }
        }
    }*/

    function updateUnlockedBalance(address account) public {
    if (_vestingSchedules[account].length > 0) {
        VestingEntry storage entry = _vestingSchedules[account][0];
        if (block.timestamp >= entry.unlockTime) {
            _unlockedBalance[account] += entry.amount;
            // Remove the first entry from the array
            for (uint256 i = 0; i < _vestingSchedules[account].length - 1; i++) {
                _vestingSchedules[account][i] = _vestingSchedules[account][i + 1];
            }
            _vestingSchedules[account].pop();
        }
    }
}

    // Modify transfer function to allow transfer of unlocked tokens only
    function transfer(
        address to,
        uint256 amount
    ) public override isWhitelisted(to) isNotBlacklisted(to) returns (bool) {
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
    )
        public
        override
        isWhitelisted(to)
        isWhitelisted(from)
        isNotBlacklisted(to)
        isNotBlacklisted(from)
        returns (bool)
    {
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
    function getNumberOfPartitionsOf(
        address tokenHolder
    ) public view returns (uint256) {
        return _partitions[tokenHolder];
    }

    // Get vesting schedule of an address
    function getVestingScheduleOf(
        address tokenHolder
    ) public view returns (VestingEntry[] memory) {
        return _vestingSchedules[tokenHolder];
    }

    // Get unlocked balance of msg.sender
    function getUnlockedBalance() public view returns (uint256) {
        require(
            _vestingSchedules[_msgSender()].length <= MAX_VESTING_ENTRIES,
            "SecurityToken: Too many vesting schedules."
        );
        return _unlockedBalance[_msgSender()];
    }
    // Get unlocked balance of an address
    function getUnlockedBalanceOf(address tokenHolder) public view returns (uint256) {
        require(
            _vestingSchedules[tokenHolder].length <= MAX_VESTING_ENTRIES,
            "SecurityToken: Too many vesting schedules."
        );
        return _unlockedBalance[tokenHolder];
    }

    //

    // **** 4. Document Management ****
    // Method to attach a document to the token
    function attachDocument(
        string memory _name,
        string memory _uri
    ) public onlyManager {
        Document memory newDoc = Document({
            name: _name,
            uri: _uri,
            deleted: false
        });
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
        require(
            index < documents.length,
            "SecurityToken: document index out of bounds"
        );
        return (documents[index].name, documents[index].uri);
    }

    // Method to remove a document from the token, by marking it as deleted and removing its name and URI
    function removeDocument(uint256 index) public onlyManager {
        require(
            index < documents.length,
            "SecurityToken: document index out of bounds"
        );
        documents[index].deleted = true;
        documents[index].name = "";
        documents[index].uri = "";
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
