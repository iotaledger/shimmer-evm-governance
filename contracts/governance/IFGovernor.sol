// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorPreventLateQuorum.sol";

contract IFGovernor is
    Governor,
    GovernorVotes,
    GovernorSettings,
    GovernorPreventLateQuorum,
    GovernorCountingSimple,
    GovernorTimelockControl
{
    // This is to replace the quorum (of the GovernorVotesQuorumFraction)
    // in percentage of the total supply of wSMR tokens
    // with the quorum in fixed amount of wSMR tokens
    uint256 private _quorumFixedAmount;

    event QuorumFixedAmountSet(
        uint256 oldQuorumFixedAmount,
        uint256 newQuorumFixedAmount
    );

    constructor(
        IVotes _token_,
        TimelockController _timelock_,
        uint48 _votingDelay_,
        uint32 _votingPeriod_,
        uint256 _proposalThreshold_,
        uint48 _lateQuorumExtension_,
        uint256 _quorumFixedAmount_
    )
        Governor("IFGovernor")
        GovernorVotes(_token_)
        GovernorSettings(_votingDelay_, _votingPeriod_, _proposalThreshold_)
        GovernorPreventLateQuorum(_lateQuorumExtension_)
        GovernorTimelockControl(_timelock_)
    {
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

    function quorum(
        uint256 timepoint
    ) public view override(Governor) returns (uint256) {
        timepoint; // avoid warning for dummy param
        return _quorumFixedAmount;
    }

    // The following functions are overrides required by Solidity.

    function _castVote(
        uint256 proposalId,
        address account,
        uint8 support,
        string memory reason,
        bytes memory params
    ) internal override(Governor, GovernorPreventLateQuorum) returns (uint256) {
        return
            GovernorPreventLateQuorum._castVote({
                proposalId: proposalId,
                account: account,
                support: support,
                reason: reason,
                params: params
            });
    }

    function proposalDeadline(
        uint256 proposalId
    )
        public
        view
        override(Governor, GovernorPreventLateQuorum)
        returns (uint256)
    {
        return GovernorPreventLateQuorum.proposalDeadline(proposalId);
    }

    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function state(
        uint256 proposalId
    )
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(
        uint256 proposalId
    ) public view override(Governor, GovernorTimelockControl) returns (bool) {
        return super.proposalNeedsQueuing(proposalId);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function _propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description,
        address proposer
    ) internal override(Governor) returns (uint256) {
        return
            super._propose(targets, values, calldatas, description, proposer);
    }

    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return
            super._queueOperations(
                proposalId,
                targets,
                values,
                calldatas,
                descriptionHash
            );
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(
            proposalId,
            targets,
            values,
            calldatas,
            descriptionHash
        );
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    // Specify the EXECUTOR role for the modifier onlyGovernance
    // Only Timelock has this role
    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }
}
