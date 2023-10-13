import { ethers, network } from "hardhat";
import { wSMR } from "../typechain-types";

async function deployIFVotesToken(): Promise<wSMR> {
  const IFVotesTokenContract = await ethers.deployContract("wSMR", []);
  await IFVotesTokenContract.waitForDeployment();

  if (network.name !== "hardhat") {
    console.log(
      "IFVotesTokenContract address:",
      await IFVotesTokenContract.getAddress()
    );
  }

  return IFVotesTokenContract;
}

export default deployIFVotesToken;
