import { ethers, network } from "hardhat";
import { MockErc721 } from "../typechain-types";

async function deployMockErc721(): Promise<MockErc721> {
  const MockErc721Contract = await ethers.deployContract("MockErc721", []);
  await MockErc721Contract.waitForDeployment();

  if (network.name !== "hardhat") {
    console.log(
      "MockErc721Contract address:",
      await MockErc721Contract.getAddress()
    );
  }

  return MockErc721Contract;
}

export default deployMockErc721;
