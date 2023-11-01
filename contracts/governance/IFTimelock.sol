// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/TimelockController.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// This Timelock contract holds funds including native gas token, erc20 and NFT.
// The funds transfer can only be via proposal execution
contract IFTimelock is TimelockController {
    modifier onlyThisContract() {
        _checkCaller(msg.sender);
        _;
    }

    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}

    function _checkCaller(address callerAddr) internal view {
        if (callerAddr != address(this)) {
            revert TimelockUnauthorizedCaller(callerAddr);
        }
    }

    // Transfer native gas token from the caller, which must be the Timelock itself,
    // to the specified recipient via the Timelock-based proposal execution.
    function transferNative(
        address payable recipient
    ) external payable onlyThisContract {
        require(recipient != address(0), "Invalid recipient address");
        recipient.transfer(msg.value);
    }

    // Transfer erc20 token from the caller, which must be the Timelock itself,
    // to the specified recipient via the Timelock-based proposal execution.
    function transferErc20(
        address erc20TokenAddress,
        address recipient,
        uint256 amount
    ) external onlyThisContract {
        require(recipient != address(0), "Invalid recipient address");
        require(erc20TokenAddress != address(0), "Invalid erc20 token address");
        require(amount > 0, "Invalid erc20 token amount");

        IERC20(erc20TokenAddress).transfer(recipient, amount);
    }

    // Transfer NFT token from the caller, which must be the Timelock itself,
    // to the specified recipient via the Timelock-based proposal execution.
    function transferNFT(
        address nftTokenAddress,
        address recipient,
        uint256 tokenId,
        uint256 amount
    ) external onlyThisContract {
        require(recipient != address(0), "Invalid recipient address");
        require(nftTokenAddress != address(0), "Invalid NFT token address");
        require(amount > 0, "Invalid NFT token amount");

        IERC165 tokenContract = IERC165(nftTokenAddress);

        if (tokenContract.supportsInterface(type(IERC1155).interfaceId)) {
            IERC1155(nftTokenAddress).safeTransferFrom(
                address(this),
                recipient,
                tokenId,
                amount,
                ""
            );
        } else {
            IERC721(nftTokenAddress).safeTransferFrom(
                address(this),
                recipient,
                tokenId
            );
        }
    }
}
