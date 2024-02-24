import { ethers, network } from "hardhat";
import { wSMR } from "../typechain-types";
import { wSMR_SHIMMER_EVM } from "../configuration";
import wSMRContractABI from "./wSMR.json";

async function deployWSMRToken(): Promise<wSMR> {
  let wSMRTokenContract;

  // On ShimmerEVM mainnet, reference the existing wSMR
  if (
    network.name === "shimmerEvmMainnet" /* ||
    network.name === "shimmerEvmTestnet" */
  ) {
    wSMRTokenContract = new ethers.Contract(
      wSMR_SHIMMER_EVM,
      wSMRContractABI,
      ethers.provider
    );
    console.log(
      "wSMRTokenContract address:",
      await wSMRTokenContract.getAddress()
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
