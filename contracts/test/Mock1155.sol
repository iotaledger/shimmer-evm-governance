// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//////////// DO NOT AUDIT ////////////////
//////////// do not audit ////////////////

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Mock1155 is ERC1155 {
    uint256 private tokenId;

    constructor() ERC1155("") {}

    function mintNewItem(uint256 amount) public returns (uint256) {
        tokenId++;
        _mint(msg.sender, tokenId, amount, "");
        return tokenId;
    }
}
