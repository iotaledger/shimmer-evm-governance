import { ethers } from "hardhat";
import { IFTimelock } from "../typechain-types";
import { TIME_LOCK_MIN_DELAY } from "../configuration";

async function deployIFTimelock(): Promise<IFTimelock> {
  const [deployer] = await ethers.getSigners();

  const IFTimelockContract = await ethers.deployContract("IFTimelock", [
    TIME_LOCK_MIN_DELAY,
    [],
    [],
    deployer.address,
  ]);
  await IFTimelockContract.waitForDeployment();

  console.log(
    "IFTimelockContract address:",
    await IFTimelockContract.getAddress()
  );

  return IFTimelockContract;
}

export default deployIFTimelock;
