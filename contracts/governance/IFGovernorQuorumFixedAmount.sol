// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";

// This contract is to replace the quorum (of the GovernorVotesQuorumFraction)
// in percentage of the total supply of wSMR tokens
// with the quorum in fixed amount of wSMR tokens
abstract contract IFGovernorQuorumFixedAmount is Governor {
    uint256 internal _quorumFixedAmount;

    event QuorumFixedAmountSet(
        uint256 oldQuorumFixedAmount,
        uint256 newQuorumFixedAmount
    );

    constructor(uint256 _quorumFixedAmount_) {
        _setQuorumFixedAmount(_quorumFixedAmount_);
    }

    /**
     * @dev Internal setter for the quorum in fixed amount.
     *
     * Emits a {QuorumFixedAmountSet} event.
     */
    function _setQuorumFixedAmount(uint256 newQuorumFixedAmount) internal {
        emit QuorumFixedAmountSet(_quorumFixedAmount, newQuorumFixedAmount);
        _quorumFixedAmount = newQuorumFixedAmount;
    }

    /**
     * @dev Update the quorum in fixed amount. This operation can only be performed through a governance proposal.
     *
     * Emits a {QuorumFixedAmountSet} event.
     */
    function setQuorumFixedAmount(
        uint256 newQuorumFixedAmount
    ) public onlyGovernance {
        _setQuorumFixedAmount(newQuorumFixedAmount);
    }
}
