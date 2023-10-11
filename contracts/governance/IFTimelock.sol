// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract IFTimelock is TimelockController {
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}

    // Transfer native SMR from the caller to the specified recipient
    function transferNativeSMR(address payable recipient) external payable {
        recipient.transfer(msg.value);
    }
}
