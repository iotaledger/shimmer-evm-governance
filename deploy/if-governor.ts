import { ethers, network } from "hardhat";
import { IFGovernor, wSMR, IFTimelock } from "../typechain-types";
import {
  PROPOSAL_QUORUM_FIXED_AMOUNT,
  PROPOSAL_VOTING_PERIOD,
  PROPOSAL_VOTING_DELAY,
  PROPOSAL_THRESHOLD,
  PROPOSAL_LATE_QUORUM_EXTENSION,
  PROPOSER_1_MULTISIG,
  PROPOSER_2_MULTISIG,
} from "../configuration";
import { toWei } from "../utils";

async function deployIFGovernor(
  IFVotesTokenContract: wSMR,
  IFTimelockContract: IFTimelock
): Promise<IFGovernor> {
  const [deployer] = await ethers.getSigners();

  const IFGovernorContract = await ethers.deployContract("IFGovernor", [
    IFVotesTokenContract,
    IFTimelockContract,
    PROPOSAL_VOTING_DELAY,
    PROPOSAL_VOTING_PERIOD,
    PROPOSAL_THRESHOLD,
    PROPOSAL_LATE_QUORUM_EXTENSION,
    network.name !== "hardhat"
      ? toWei(PROPOSAL_QUORUM_FIXED_AMOUNT)
      : toWei(45), // for unit-test with hardhat network
    network.name !== "hardhat"
      ? [PROPOSER_1_MULTISIG, PROPOSER_2_MULTISIG]
      : [deployer.address], // for unit-test with hardhat network
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
