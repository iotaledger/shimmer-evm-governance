import { expect } from "chai";
import { ethers } from "hardhat";
import { EventLog } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { IFGovernor, wSMR, IFTimelock } from "../typechain-types";
import deployIFGovernor from "../deploy/if-governor";
import deployIFVotesToken from "../deploy/wSMR-token";
import deployIFTimelock from "../deploy/if-timelock";
import { ADDRESS_ZERO } from "../utils/constants";
import {
  TIME_LOCK_MIN_DELAY,
  PROPOSAL_THRESHOLD,
  PROPOSAL_QUORUM_FIXED_AMOUNT,
  PROPOSAL_VOTING_DELAY,
  PROPOSAL_VOTING_PERIOD,
  PROPOSAL_LATE_QUORUM_EXTENSION,
} from "../configuration";
import { getBalanceNative, toWei } from "../utils";
import setupGovernance from "../deploy/setup-governance";

describe("IF governance test of proposal creation for transferring native SMR with late quorum extension", () => {
  let IFGovernorContract: IFGovernor;
  let IFVotesTokenContract: wSMR;
  let IFTimelockContract: IFTimelock;
  let signer: any;
  let voter1: any;
  let voter2: any;
  let voter3: any;
  let voter4: any;
  let PROPOSER_ROLE: string;
  let EXECUTOR_ROLE: string;
  let ADMIN_ROLE: string;
  let PROPOSAL_DESCRIPTION: string;
  let PROPOSAL_DESCRIPTION_HASH: string;
  let proposalId: string;
  let proposalState: bigint;
  let encodedFunctionCall: string;
  const voteOption = 1; // for
  const voteReason = "good reason";
  const RECIPIENT_NATIVE_SMR = "0xb20C10460Ae817998025AdBC19b265F3B949cb7c";
  const RECIPIENT_NATIVE_SMR_AMOUNT = toWei(1); // 1 SMR
  const VOTER_1_NATIVE_SMR_AMOUNT = 40;
  const VOTER_2_NATIVE_SMR_AMOUNT = 5;
  const VOTER_3_NATIVE_SMR_AMOUNT = 45;
  const VOTER_4_NATIVE_SMR_AMOUNT = 45;

  enum ProposalState {
    Pending,
    Active,
    Canceled,
    Defeated,
    Succeeded,
    Queued,
    Expired,
    Executed,
  }

  async function queueProposal() {
    return IFGovernorContract.queue(
      [IFTimelockContract],

      // Specify the {value: ...} for interacting with payable func
      // Set to 0 for non payable function
      [RECIPIENT_NATIVE_SMR_AMOUNT],

      [encodedFunctionCall],
      PROPOSAL_DESCRIPTION_HASH
    );
  }

  async function executeProposal() {
    return IFGovernorContract.execute(
      [IFTimelockContract],

      // Specify the {value: ...} for interacting with payable func
      // Set to 0 for non payable function
      [RECIPIENT_NATIVE_SMR_AMOUNT],

      [encodedFunctionCall],
      PROPOSAL_DESCRIPTION_HASH
    );
  }

  // With Governor, the proposal can only be cancelled if it is still in voting delay (i.e. not yet active for voting).
  async function cancelProposalWithGovernor() {
    return IFGovernorContract.cancel(
      [IFTimelockContract],

      // Specify the {value: ...} for interacting with payable func
      // Set to 0 for non payable function
      [RECIPIENT_NATIVE_SMR_AMOUNT],

      [encodedFunctionCall],
      PROPOSAL_DESCRIPTION_HASH
    );
  }

  it("Deploy governance contracts", async () => {
    [signer, voter1, voter2, voter3, voter4] = await ethers.getSigners();
    IFVotesTokenContract = await deployIFVotesToken();
    IFTimelockContract = await deployIFTimelock();
    IFGovernorContract = await deployIFGovernor(
      IFVotesTokenContract,
      IFTimelockContract
    );
  });

  it("Setup governance", async () => {
    const setUpResult = await setupGovernance(
      IFTimelockContract,
      IFGovernorContract
    );
    PROPOSER_ROLE = setUpResult.PROPOSER_ROLE;
    EXECUTOR_ROLE = setUpResult.EXECUTOR_ROLE;
    ADMIN_ROLE = setUpResult.ADMIN_ROLE;

    expect(await IFTimelockContract.hasRole(PROPOSER_ROLE, IFGovernorContract))
      .to.be.true;

    expect(await IFTimelockContract.hasRole(EXECUTOR_ROLE, ADDRESS_ZERO)).to.be
      .true;

    expect(await IFTimelockContract.hasRole(ADMIN_ROLE, signer)).to.be.false;
  });

  it("Verify wSMR total supply after users have deposited", async () => {
    expect(await IFVotesTokenContract.name()).to.equal("wSMR");
    expect(await IFVotesTokenContract.symbol()).to.equal("wSMR");
    expect(await IFVotesTokenContract.totalSupply()).to.equal("0");

    // Voter1 gets wSMR by depositing native SMR
    await IFVotesTokenContract.connect(voter1).deposit({
      value: toWei(VOTER_1_NATIVE_SMR_AMOUNT),
    });
    // Voter2 gets wSMR by depositing native SMR
    await IFVotesTokenContract.connect(voter2).deposit({
      value: toWei(VOTER_2_NATIVE_SMR_AMOUNT),
    });
    // Voter3 gets wSMR by depositing native SMR
    await IFVotesTokenContract.connect(voter3).deposit({
      value: toWei(VOTER_3_NATIVE_SMR_AMOUNT),
    });
    // Voter4 gets wSMR by depositing native SMR
    await IFVotesTokenContract.connect(voter4).deposit({
      value: toWei(VOTER_4_NATIVE_SMR_AMOUNT),
    });

    expect(await IFVotesTokenContract.totalSupply()).to.equal(
      toWei(
        VOTER_1_NATIVE_SMR_AMOUNT +
          VOTER_2_NATIVE_SMR_AMOUNT +
          VOTER_3_NATIVE_SMR_AMOUNT +
          VOTER_4_NATIVE_SMR_AMOUNT
      )
    );
  });

  it("Create proposal to transfer native SMR to the specified RECIPIENT_NATIVE_SMR", async () => {
    PROPOSAL_DESCRIPTION = "My first-ever proposal";
    PROPOSAL_DESCRIPTION_HASH = ethers.id(PROPOSAL_DESCRIPTION);

    // No need to specify {value: ...} when encodeFunctionData
    // because the "value" will be specified when calling the function
    // propose(), queue() and execute() of Governor contract
    encodedFunctionCall = IFTimelockContract.interface.encodeFunctionData(
      "transferNativeSMR",
      [RECIPIENT_NATIVE_SMR]
    );

    // Because of no voting delay, once created, the proposal voting will start immediately
    // Thus, the voting power snapshot is also performed immediately
    // Meaning that, the users need to delegate for voting power before the proposal creation
    await IFVotesTokenContract.connect(voter1).delegate(voter1);
    await IFVotesTokenContract.connect(voter2).delegate(voter2);
    await IFVotesTokenContract.connect(voter3).delegate(voter3);

    const proposeTx = await IFGovernorContract.propose(
      [IFTimelockContract],

      // Specify the {value: ...} for interacting with payable func
      // Set to 0 for non payable function
      [RECIPIENT_NATIVE_SMR_AMOUNT],

      [encodedFunctionCall],
      PROPOSAL_DESCRIPTION
    );

    const receipt = await proposeTx.wait();
    const logs = receipt?.logs[0] as EventLog;
    proposalId = logs.args[0].toString();
  });

  it("Big vote on the proposal to make it reach the quorum. Verify the voting period extension", async () => {
    await time.increase(PROPOSAL_VOTING_DELAY + 1);

    proposalState = await IFGovernorContract.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Active);

    // Get proposal deadline before big vote
    // It must be same as PROPOSAL_VOTING_PERIOD
    const proposalDeadlineTimePointBeforeBigVote =
      await IFGovernorContract.proposalDeadline(proposalId);
    let currentTime = await time.latest();
    const proposalDeadlineDurationBeforeBigVote =
      proposalDeadlineTimePointBeforeBigVote - BigInt(currentTime);
    expect(proposalDeadlineDurationBeforeBigVote).to.below(
      PROPOSAL_VOTING_PERIOD + 60 // deviation of 60s
    );
    expect(proposalDeadlineDurationBeforeBigVote).to.greaterThan(
      PROPOSAL_VOTING_PERIOD - 60 // deviation of 60s
    );

    // Big vote from voter3 to make the proposal reach its quorum
    await IFGovernorContract.connect(voter3).castVoteWithReason(
      proposalId,
      voteOption,
      voteReason
    );

    // Get proposal deadline after big vote
    // It must still be same as PROPOSAL_VOTING_PERIOD
    // because the remaining voting period > later quorum extension
    let proposalDeadlineTimePointAfterBigVote =
      await IFGovernorContract.proposalDeadline(proposalId);
    currentTime = await time.latest();
    let proposalDeadlineDurationAfterBigVote =
      proposalDeadlineTimePointAfterBigVote - BigInt(currentTime);
    expect(proposalDeadlineDurationAfterBigVote).to.below(
      PROPOSAL_VOTING_PERIOD + 60 // deviation of 60s
    );
    expect(proposalDeadlineDurationAfterBigVote).to.greaterThan(
      PROPOSAL_VOTING_PERIOD - 60 // deviation of 60s
    );

    // Check proposal votes
    const proposalVotes = await IFGovernorContract.proposalVotes(proposalId);
    // console.log("proposalVotes:", proposalVotes);
    const againstVotes = proposalVotes[0];
    const forVotes = proposalVotes[1];
    const abstainVotes = proposalVotes[2];
    expect(againstVotes).to.equal(toWei(0));
    expect(forVotes).to.equal(toWei(45));
    expect(abstainVotes).to.equal(toWei(0));

    // Move current voting period to within the last PROPOSAL_LATE_QUORUM_EXTENSION period
    await time.increase(
      PROPOSAL_VOTING_PERIOD - PROPOSAL_LATE_QUORUM_EXTENSION + 1
    );

    // Big vote from voter4 to make the proposal reach its quorum
    await IFGovernorContract.connect(voter4).castVoteWithReason(
      proposalId,
      voteOption,
      voteReason
    );

    // Get proposal deadline after big vote
    // It must now be same as PROPOSAL_LATE_QUORUM_EXTENSION
    // because the remaining voting period < later quorum extension
    proposalDeadlineTimePointAfterBigVote =
      await IFGovernorContract.proposalDeadline(proposalId);
    currentTime = await time.latest();
    proposalDeadlineDurationAfterBigVote =
      proposalDeadlineTimePointAfterBigVote - BigInt(currentTime);
    expect(proposalDeadlineDurationAfterBigVote).to.below(
      PROPOSAL_LATE_QUORUM_EXTENSION + 60 // deviation of 60s
    );
    expect(proposalDeadlineDurationAfterBigVote).to.greaterThan(
      PROPOSAL_LATE_QUORUM_EXTENSION - 60 // deviation of 60s
    );

    // Check if voting period is extended by the specify "PROPOSAL_LATE_QUORUM_EXTENSION"
    // Meaning that, proposal status must not be SUCCEEDED and still ACTIVE
    proposalState = await IFGovernorContract.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Active);

    // Move the current voting period, which is now PROPOSAL_LATE_QUORUM_EXTENSION, to the end
    await time.increase(PROPOSAL_LATE_QUORUM_EXTENSION + 1);

    // Verify the proposal state that must be Succeeded
    proposalState = await IFGovernorContract.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Succeeded);
  });

  it("Queue & Execute the proposal", async () => {
    // The successful proposal needs to be queued manually
    // The Timelock deplay will start from this moment
    const queueTx = await queueProposal();
    await queueTx.wait();

    await time.increase(TIME_LOCK_MIN_DELAY + 1);

    proposalState = await IFGovernorContract.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Queued);

    // Fund native SMR for the Timelock
    const timelockAddress = await (IFTimelockContract as any).getAddress();
    await signer.sendTransaction({
      to: timelockAddress,
      value: RECIPIENT_NATIVE_SMR_AMOUNT,
    });
    expect(await getBalanceNative(timelockAddress)).to.equal(
      RECIPIENT_NATIVE_SMR_AMOUNT
    );
    //////

    const executeTx = await executeProposal();
    await executeTx.wait();

    proposalState = await IFGovernorContract.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Executed);
    expect(await getBalanceNative(timelockAddress)).to.equal("0");
    expect(await getBalanceNative(RECIPIENT_NATIVE_SMR)).to.equal(
      RECIPIENT_NATIVE_SMR_AMOUNT
    );
  });
});
