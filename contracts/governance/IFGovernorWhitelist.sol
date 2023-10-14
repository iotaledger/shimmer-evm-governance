// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";

// This contract is to implement whitelist of the addresses
// that are allowed to perform some critical functions like creating proposal
abstract contract IFGovernorWhitelist is Governor {
    mapping(address => bool) private _whitelistAddressList;

    event WhiteListAdded(address addr_);
    event WhiteListRemoved(address addr_);

    modifier onlyWhitelisted() {
        require(
            _whitelistAddressList[msg.sender] == true,
            "IFGovernorWhitelist: not whitelisted"
        );
        _;
    }

    constructor(address[] memory _addrList_) {
        for (uint256 i = 0; i < _addrList_.length; i++) {
            _addToWhitelist(_addrList_[i]);
        }
    }

    /**
     * @dev Internal setter for adding the specified address into whitelist list.
     *
     * Emits a {WhiteListAdded} event.
     */
    function _addToWhitelist(address addr_) internal {
        require(addr_ != address(0), "IFGovernorWhitelist: invalid address");

        _whitelistAddressList[addr_] = true;

        emit WhiteListAdded(addr_);
    }

    /**
     * @dev Add the specified address into whitelist list. This operation can only be performed through a governance proposal.
     *
     * Emits a {WhiteListAdded} event.
     */
    function addToWhitelist(address addr_) public onlyGovernance {
        _addToWhitelist(addr_);
    }

    /**
     * @dev Remove the specified address from whitelist list. This operation can only be performed through a governance proposal.
     *
     * Emits a {WhiteListAdded} event.
     */
    function removeFromWhitelist(address addr_) public onlyGovernance {
        require(addr_ != address(0), "IFGovernorWhitelist: invalid address");

        _whitelistAddressList[addr_] = false;

        emit WhiteListRemoved(addr_);
    }

    function isWhitelisted(address addr_) public view returns (bool) {
        return _whitelistAddressList[addr_];
    }
}
