import { ethers } from "hardhat";
import { wSMR } from "../typechain-types";

async function deployIFVotesToken(): Promise<wSMR> {
  const IFVotesTokenContract = await ethers.deployContract("wSMR", []);
  await IFVotesTokenContract.waitForDeployment();

  console.log(
    "IFVotesTokenContract address:",
    await IFVotesTokenContract.getAddress()
  );

  return IFVotesTokenContract;
}

export default deployIFVotesToken;
