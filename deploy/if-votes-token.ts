import { ethers } from "hardhat";
import { IFVotesToken } from "../typechain-types";
import { IF_VOTES_TOKEN_NAME, IF_VOTES_TOKEN_SYMBOL } from "../configuration";

async function deployIFVotesToken(): Promise<IFVotesToken> {
  const IFVotesTokenContract = await ethers.deployContract("IFVotesToken", [
    IF_VOTES_TOKEN_NAME,
    IF_VOTES_TOKEN_SYMBOL,
  ]);
  await IFVotesTokenContract.waitForDeployment();

  console.log(
    "IFVotesTokenContract address:",
    await IFVotesTokenContract.getAddress()
  );

  return IFVotesTokenContract;
}

export default deployIFVotesToken;
