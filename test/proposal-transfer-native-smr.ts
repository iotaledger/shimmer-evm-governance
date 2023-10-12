import { expect } from "chai";
import { ethers } from "hardhat";
import { EventLog } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { IFGovernor, wSMR, IFTimelock } from "../typechain-types";
import deployIFGovernor from "../deploy/if-governor";
import deployIFVotesToken from "../deploy/if-votes-token";
import deployIFTimelock from "../deploy/if-timelock";
import { ADDRESS_ZERO } from "../utils/constants";
import {
  TIME_LOCK_MIN_DELAY,
  PROPOSAL_THRESHOLD,
  PROPOSAL_QUORUM_PERCENT,
  PROPOSAL_VOTING_DELAY,
  PROPOSAL_VOTING_PERIOD,
} from "../configuration";
import { getBalanceNative } from "../utils";
import setupGovernance from "../deploy/setup-governance";

describe("IF governance test of proposal creation for transferring native SMR", () => {
  let IFGovernorContract: IFGovernor;
  let IFVotesTokenContract: wSMR;
  let IFTimelockContract: IFTimelock;
  let signer: any;
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
  const RECIPIENT = "0x57bA4DBea3198e48af45117e93e2abb9822BEA48";
  const RECIPIENT_AMOUNT = "1000000"; // 1 SMR

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
      [RECIPIENT_AMOUNT],

      [encodedFunctionCall],
      PROPOSAL_DESCRIPTION_HASH
    );
  }

  async function executeProposal() {
    return IFGovernorContract.execute(
      [IFTimelockContract],

      // Specify the {value: ...} for interacting with payable func
      // Set to 0 for non payable function
      [RECIPIENT_AMOUNT],

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
      [RECIPIENT_AMOUNT],

      [encodedFunctionCall],
      PROPOSAL_DESCRIPTION_HASH
    );
  }

  it("Deploy governance contracts", async () => {
    [signer] = await ethers.getSigners();
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

  it("Verify wSMR contract property", async () => {
    expect(await IFVotesTokenContract.name()).to.equal("wSMR");
    expect(await IFVotesTokenContract.symbol()).to.equal("wSMR");
    expect(await IFVotesTokenContract.totalSupply()).to.equal("0");

    // Get wSMR by depositing native SMR
    await IFVotesTokenContract.deposit({ value: RECIPIENT_AMOUNT });
    expect(await IFVotesTokenContract.totalSupply()).to.equal(RECIPIENT_AMOUNT);
  });

  it("Verify IFGovernor contract property", async () => {
    expect(await IFGovernorContract["quorumNumerator()"]()).to.equal(
      PROPOSAL_QUORUM_PERCENT
    );
    expect(await IFGovernorContract.votingDelay()).to.equal(
      PROPOSAL_VOTING_DELAY
    );
    expect(await IFGovernorContract.votingPeriod()).to.equal(
      PROPOSAL_VOTING_PERIOD
    );
    expect(await IFGovernorContract.proposalThreshold()).to.equal(
      PROPOSAL_THRESHOLD
    );
  });

  it("Create proposal to transfer native SMR to the specified recipient", async () => {
    PROPOSAL_DESCRIPTION = "My first-ever proposal";
    PROPOSAL_DESCRIPTION_HASH = ethers.id(PROPOSAL_DESCRIPTION);

    // No need to specify {value: ...} when encodeFunctionData
    // because the "value" will be specified when calling the function
    // propose(), queue() and execute() of Governor contract
    encodedFunctionCall = IFTimelockContract.interface.encodeFunctionData(
      "transferNativeSMR",
      [RECIPIENT]
    );

    // Because of voting delay, once created, the proposal voting will start immediately
    // Thus, the voting power snapshot is also performed immediately
    // Meaning that, the users need to delegate for voting power before the proposal creation
    await IFVotesTokenContract.delegate(signer);

    const proposeTx = await IFGovernorContract.propose(
      [IFTimelockContract],

      // Specify the {value: ...} for interacting with payable func
      // Set to 0 for non payable function
      [RECIPIENT_AMOUNT],

      [encodedFunctionCall],
      PROPOSAL_DESCRIPTION
    );

    const receipt = await proposeTx.wait();
    const logs = receipt?.logs[0] as EventLog;
    proposalId = logs.args[0].toString();

    // No voting delay, no need to check Pending status
    // proposalState = await IFGovernorContract.state(proposalId);
    // expect(proposalState).to.equal(ProposalState.Pending);
  });

  it("Vote the created proposal. If proposal still active, any attempt to queue/execute/cancel it will revert.", async () => {
    await time.increase(PROPOSAL_VOTING_DELAY + 1);

    proposalState = await IFGovernorContract.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Active);

    await expect(queueProposal()).to.be.revertedWithCustomError(
      IFGovernorContract,
      "GovernorUnexpectedProposalState"
    );

    await expect(executeProposal()).to.be.revertedWithCustomError(
      IFGovernorContract,
      "GovernorUnexpectedProposalState"
    );

    await expect(cancelProposalWithGovernor()).to.be.revertedWithCustomError(
      IFGovernorContract,
      "GovernorUnexpectedProposalState"
    );

    const voteTx = await IFGovernorContract.castVoteWithReason(
      proposalId,
      voteOption,
      voteReason
    );
    await voteTx.wait();

    const timeAtVote = await time.latest();
    await time.increase(PROPOSAL_VOTING_PERIOD + 1);

    const currentQuorum = await IFGovernorContract.quorum(timeAtVote);
    console.log("currentQuorum:", currentQuorum);

    const currentVotesTokenSupply = await IFVotesTokenContract.totalSupply();
    console.log("currentVotesTokenSupply:", currentVotesTokenSupply);

    proposalState = await IFGovernorContract.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Succeeded);
  });

  it("Queue & Execute the proposal", async () => {
    // The successful proposal needs to be queued manually
    // The Timelock deplay will start from this moment
    const queueTx = await queueProposal();
    await queueTx.wait();

    // await cancelProposalWithTimelock();

    await time.increase(TIME_LOCK_MIN_DELAY + 1);

    proposalState = await IFGovernorContract.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Queued);

    // Fund native SMR for the Timelock
    const timelockAddress = await (IFTimelockContract as any).getAddress();
    await signer.sendTransaction({
      to: timelockAddress,
      value: RECIPIENT_AMOUNT,
    });
    expect(await getBalanceNative(timelockAddress)).to.equal(RECIPIENT_AMOUNT);
    //////

    const executeTx = await executeProposal();
    await executeTx.wait();

    proposalState = await IFGovernorContract.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Executed);
    expect(await getBalanceNative(timelockAddress)).to.equal("0");
    expect(await getBalanceNative(RECIPIENT)).to.equal(RECIPIENT_AMOUNT);
  });

  it("Governance settings change will revert if not via proposal execution", async () => {
    // The modifier onlyGovernance ensures that only Timelock contract can update Governance settings

    await expect(
      IFGovernorContract.updateQuorumNumerator(1)
    ).to.be.revertedWithCustomError(IFGovernorContract, "GovernorOnlyExecutor");

    await expect(
      IFGovernorContract.setVotingDelay(1)
    ).to.be.revertedWithCustomError(IFGovernorContract, "GovernorOnlyExecutor");

    await expect(
      IFGovernorContract.setVotingPeriod(1)
    ).to.be.revertedWithCustomError(IFGovernorContract, "GovernorOnlyExecutor");

    await expect(
      IFGovernorContract.setProposalThreshold(1)
    ).to.be.revertedWithCustomError(IFGovernorContract, "GovernorOnlyExecutor");

    await expect(
      IFGovernorContract.setLateQuorumVoteExtension(1)
    ).to.be.revertedWithCustomError(IFGovernorContract, "GovernorOnlyExecutor");

    await expect(
      IFTimelockContract.updateDelay(1)
    ).to.be.revertedWithCustomError(
      IFTimelockContract,
      "TimelockUnauthorizedCaller"
    );
  });
});
