import { ethers, network } from "hardhat";
import { MockErc1155 } from "../typechain-types";

async function deployMockErc1155(): Promise<MockErc1155> {
  const MockErc1155Contract = await ethers.deployContract("MockErc1155", []);
  await MockErc1155Contract.waitForDeployment();

  if (network.name !== "hardhat") {
    console.log(
      "MockErc1155Contract address:",
      await MockErc1155Contract.getAddress()
    );
  }

  return MockErc1155Contract;
}

export default deployMockErc1155;
