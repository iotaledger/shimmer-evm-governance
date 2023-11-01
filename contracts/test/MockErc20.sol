// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//////////// DO NOT AUDIT ////////////////
//////////// do not audit ////////////////

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockErc20 is ERC20 {
    constructor() ERC20("MockErc20", "ME") {
        _mint(msg.sender, 1 * 10 ** 9 * 10 ** 18);
    }
}
