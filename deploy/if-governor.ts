import { ethers } from "hardhat";
import { IFGovernor, wSMR, IFTimelock } from "../typechain-types";
import {
  PROPOSAL_QUORUM_PERCENT,
  PROPOSAL_VOTING_PERIOD,
  PROPOSAL_VOTING_DELAY,
  PROPOSAL_THRESHOLD,
  PROPOSAL_LATE_QUORUM_EXTENSION,
} from "../configuration";

async function deployIFGovernor(
  IFVotesTokenContract: wSMR,
  IFTimelockContract: IFTimelock
): Promise<IFGovernor> {
  const IFGovernorContract = await ethers.deployContract("IFGovernor", [
    IFVotesTokenContract,
    IFTimelockContract,
    PROPOSAL_VOTING_DELAY,
    PROPOSAL_VOTING_PERIOD,
    PROPOSAL_THRESHOLD,
    PROPOSAL_LATE_QUORUM_EXTENSION,
    PROPOSAL_QUORUM_PERCENT,
  ]);
  await IFGovernorContract.waitForDeployment();

  console.log(
    "IFGovernorContract address:",
    await IFGovernorContract.getAddress()
  );

  return IFGovernorContract;
}

export default deployIFGovernor;
