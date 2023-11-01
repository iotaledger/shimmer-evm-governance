import { ethers, network } from "hardhat";
import { MockErc20 } from "../typechain-types";

async function deployMockErc20(): Promise<MockErc20> {
  const MockErc20Contract = await ethers.deployContract("MockErc20", []);
  await MockErc20Contract.waitForDeployment();

  if (network.name !== "hardhat") {
    console.log(
      "MockErc20Contract address:",
      await MockErc20Contract.getAddress()
    );
  }

  return MockErc20Contract;
}

export default deployMockErc20;
