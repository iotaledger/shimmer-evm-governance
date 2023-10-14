import { ethers, network } from "hardhat";
import { Contract } from "ethers";
import { wSMR } from "../typechain-types";
import { wSMR_SHIMMER_EVM_MAINNET } from "../configuration";
import wSMRContractABI from "./wSMR.json";

async function deployWSMRToken(): Promise<wSMR> {
  let wSMRTokenContract;

  // On ShimmerEVM mainnet, reference the existing wSMR
  if (network.name === "shimmerEvmMainnet") {
    wSMRTokenContract = new ethers.Contract(
      wSMR_SHIMMER_EVM_MAINNET,
      wSMRContractABI,
      ethers.provider
    );
  } else {
    wSMRTokenContract = await ethers.deployContract("wSMR", []);
    await wSMRTokenContract.waitForDeployment();

    if (network.name !== "hardhat") {
      console.log(
        "wSMRTokenContract address:",
        await wSMRTokenContract.getAddress()
      );
    }
  }

  return wSMRTokenContract;
}

export default deployWSMRToken;
