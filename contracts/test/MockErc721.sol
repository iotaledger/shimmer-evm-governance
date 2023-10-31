// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//////////// DO NOT AUDIT ////////////////
//////////// do not audit ////////////////

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockErc721 is ERC721 {
    uint256 private tokenId;

    constructor() ERC721("MockErc721", "ME721") {}

    function mintNewItem() public returns (uint256) {
        tokenId++;
        _safeMint(msg.sender, tokenId);
        return tokenId;
    }
}
