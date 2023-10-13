import { ethers, network } from "hardhat";
import { IFGovernor, wSMR, IFTimelock } from "../typechain-types";
import {
  PROPOSAL_QUORUM_FIXED_AMOUNT,
  PROPOSAL_VOTING_PERIOD,
  PROPOSAL_VOTING_DELAY,
  PROPOSAL_THRESHOLD,
  PROPOSAL_LATE_QUORUM_EXTENSION,
} from "../configuration";
import { toWei } from "../utils";

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
    toWei(PROPOSAL_QUORUM_FIXED_AMOUNT),
  ]);
  await IFGovernorContract.waitForDeployment();

  if (network.name !== "hardhat") {
    console.log(
      "IFGovernorContract address:",
      await IFGovernorContract.getAddress()
    );
  }

  return IFGovernorContract;
}

export default deployIFGovernor;
