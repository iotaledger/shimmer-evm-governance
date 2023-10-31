import { expect } from "chai";
import { ethers } from "hardhat";
import { EventLog } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { IFGovernor, wSMR, IFTimelock, MockErc20 } from "../typechain-types";
import deployIFGovernor from "../deploy/if-governor";
import deployIFVotesToken from "../deploy/wSMR-token";
import deployMockErc20 from "../deploy/mock-erc20-token";
import deployIFTimelock from "../deploy/if-timelock";
import { ADDRESS_ZERO } from "../utils/constants";
import {
  TIME_LOCK_MIN_DELAY,
  PROPOSAL_THRESHOLD,
  PROPOSAL_VOTING_DELAY,
  PROPOSAL_VOTING_PERIOD,
} from "../configuration";
import { toWei } from "../utils";
import setupGovernance from "../deploy/setup-governance";

describe("IF governance test of proposal creation for transferring ERC20 tokens", () => {
  let IFGovernorContract: IFGovernor;
  let IFVotesTokenContract: wSMR;
  let MockErc20Contract: MockErc20;
  let MockErc20ContractAddress: string;
  let IFTimelockContract: IFTimelock;
  let signer: any;
  let voter1: any;
  let voter2: any;
  let voter3: any;
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
  const RECIPIENT_ERC20 = ethers.Wallet.createRandom().address;
  const RECIPIENT_ERC20_AMOUNT = toWei(5); // 5 erc20 tokens
  const VOTER_1_NATIVE_SMR_AMOUNT = 40;
  const VOTER_2_NATIVE_SMR_AMOUNT = 5;
  const VOTER_3_NATIVE_SMR_AMOUNT = 45;
  const TOTAL_SUPPLY_wSMR = 90;

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
      [0],

      [encodedFunctionCall],
      PROPOSAL_DESCRIPTION_HASH
    );
  }

  async function executeProposal() {
    return IFGovernorContract.execute(
      [IFTimelockContract],

      // Specify the {value: ...} for interacting with payable func
      // Set to 0 for non payable function
      [0],

      [encodedFunctionCall],
      PROPOSAL_DESCRIPTION_HASH
    );
  }

  // With the Governor, the proposal can only be canceled if it is still in voting delay (i.e., not yet active for voting).
  async function cancelProposalWithGovernor() {
    return IFGovernorContract.cancel(
      [IFTimelockContract],

      // Specify the {value: ...} for interacting with payable func
      // Set to 0 for non payable function
      [0],

      [encodedFunctionCall],
      PROPOSAL_DESCRIPTION_HASH
    );
  }

  it("Deploy governance contracts", async () => {
    [signer, voter1, voter2, voter3] = await ethers.getSigners();
    IFVotesTokenContract = await deployIFVotesToken();
    MockErc20Contract = await deployMockErc20();
    MockErc20ContractAddress = await MockErc20Contract.getAddress();
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

    expect(await IFVotesTokenContract.totalSupply()).to.equal(
      toWei(TOTAL_SUPPLY_wSMR)
    );
  });

  it("Verify IFGovernor contract property", async () => {
    expect(await IFGovernorContract.quorum(1)).to.equal(
      // toWei(PROPOSAL_QUORUM_FIXED_AMOUNT)
      toWei(45) // for unit-test, quorum in fixed amount is set to be 45 when deploying the Governor
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

  it("Any attempt to create proposal from not whitelisted address will fail.", async () => {
    PROPOSAL_DESCRIPTION =
      "My first-ever proposal from not whitelisted address";
    PROPOSAL_DESCRIPTION_HASH = ethers.id(PROPOSAL_DESCRIPTION);

    encodedFunctionCall = IFTimelockContract.interface.encodeFunctionData(
      "transferErc20",
      [MockErc20ContractAddress, RECIPIENT_ERC20, RECIPIENT_ERC20_AMOUNT]
    );

    // Only the whitelisted address can create proposals
    await expect(
      IFGovernorContract.connect(voter3).propose(
        [IFTimelockContract],

        // Specify the {value: ...} for interacting with payable func
        // Set to 0 for non payable function
        [0],

        [encodedFunctionCall],
        PROPOSAL_DESCRIPTION
      )
    ).to.be.revertedWith("IFGovernor: not whitelisted proposer address");
  });

  it("Create proposal to transfer ERC20 tokens to the specified RECIPIENT_ERC20", async () => {
    PROPOSAL_DESCRIPTION = "My first-ever proposal";
    PROPOSAL_DESCRIPTION_HASH = ethers.id(PROPOSAL_DESCRIPTION);

    encodedFunctionCall = IFTimelockContract.interface.encodeFunctionData(
      "transferErc20",
      [MockErc20ContractAddress, RECIPIENT_ERC20, RECIPIENT_ERC20_AMOUNT]
    );

    // Because of no voting delay, once created, the proposal voting will start immediately
    // Thus, the voting power snapshot is also performed immediately
    //Means that the users need to delegate voting power before the proposal creation
    await IFVotesTokenContract.connect(voter1).delegate(voter1);
    await IFVotesTokenContract.connect(voter2).delegate(voter2);

    const proposeTx = await IFGovernorContract.propose(
      [IFTimelockContract],

      // Specify the {value: ...} for interacting with payable func
      // Set to 0 for non payable function
      [0],

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

    // Voters vote
    await IFGovernorContract.connect(voter1).castVoteWithReason(
      proposalId,
      voteOption,
      voteReason
    );

    await IFGovernorContract.connect(voter2).castVoteWithReason(
      proposalId,
      voteOption,
      voteReason
    );

    // Voting period over
    const timeAtVote = await time.latest();
    await time.increase(PROPOSAL_VOTING_PERIOD + 1);

    // console.log("currentQuorum:", currentQuorum);

    // console.log("currentVotesTokenSupply:", currentVotesTokenSupply);

    proposalState = await IFGovernorContract.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Succeeded);
  });

  it("Queue & Execute the proposal", async () => {
    // The successful proposal needs to be queued manually
    // The Timelock delay will start from this moment
    const queueTx = await queueProposal();
    await queueTx.wait();

    await time.increase(TIME_LOCK_MIN_DELAY + 1);

    proposalState = await IFGovernorContract.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Queued);

    // Fund ERC20 tokens for the Timelock
    const timelockAddress = await (IFTimelockContract as any).getAddress();

    await MockErc20Contract.transfer(timelockAddress, RECIPIENT_ERC20_AMOUNT);
    expect(await MockErc20Contract.balanceOf(timelockAddress)).to.equal(
      RECIPIENT_ERC20_AMOUNT
    );
    expect(await MockErc20Contract.balanceOf(RECIPIENT_ERC20)).to.equal(0);
    //////

    const executeTx = await executeProposal();
    await executeTx.wait();

    proposalState = await IFGovernorContract.state(proposalId);
    expect(proposalState).to.equal(ProposalState.Executed);
    expect(await MockErc20Contract.balanceOf(timelockAddress)).to.equal(0);
    expect(await MockErc20Contract.balanceOf(RECIPIENT_ERC20)).to.equal(
      RECIPIENT_ERC20_AMOUNT
    );
  });

  it("Governance settings change will revert if not via proposal execution", async () => {
    // The modifier onlyGovernance ensures that only Timelock contract can update Governance settings

    await expect(
      IFGovernorContract.setQuorumFixedAmount(1)
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
