// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//////////// DO NOT AUDIT ////////////////
//////////// do not audit ////////////////

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockErc20 is ERC20 {
    constructor() ERC20("USDTMock", "USDTMock") {
        _mint(msg.sender, 10 * 10 ** 9 * 10 ** 18); // 10B tokens
    }
}
