// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract IFTimelock is TimelockController {
    constructor(
        // minDelay: time to wait before execution
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        // admin - optional account to be granted admin role; by default zero address
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
}
