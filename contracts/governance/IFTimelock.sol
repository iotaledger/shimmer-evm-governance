// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/TimelockController.sol";

// This Timelock contract holds funds like native SMR
// The funds transfer can only be via proposal execution
contract IFTimelock is TimelockController {
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}

    // Transfer native gas token from the caller to the specified recipient.
    // The caller must be the timelock itself.
    // Means that, it must go via proposal execution.
    function transferNative(address payable recipient) external payable {
        address sender = _msgSender();
        if (sender != address(this)) {
            revert TimelockUnauthorizedCaller(sender);
        }

        recipient.transfer(msg.value);
    }
}
