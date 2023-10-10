// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//////////// DO NOT AUDIT ////////////////
//////////// do not audit ////////////////

import "@openzeppelin/contracts/access/AccessControl.sol";

// Optional contract that implements custom action for the proposal execution
// Timelock contract needs to have OPERATOR_ROLE to run the custom action function
// The custom action here is for example the function setPrice()
contract CustomActionContract is AccessControl {
    uint256 private price;
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    event PriceChanged(uint256 newPrice);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(OPERATOR_ROLE, _msgSender());
    }

    function setPrice(uint256 _price) external onlyRole(OPERATOR_ROLE) {
        require(_price > 0, "Non-zero price");
        price = _price;
        emit PriceChanged(_price);
    }

    function getPrice() external view returns (uint256) {
        return price;
    }
}
