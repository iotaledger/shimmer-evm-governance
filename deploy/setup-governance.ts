import { ethers } from "hardhat";
import { IFGovernor, IFTimelock } from "../typechain-types";
import { ADDRESS_ZERO } from "../utils/constants";
import { TIME_LOCK_ADMIN_MULTISIG } from "../configuration";

async function setupGovernance(
  IFTimelockContract: IFTimelock,
  IFGovernorContract: IFGovernor
) {
  const [deployer] = await ethers.getSigners();

  const PROPOSER_ROLE = await IFTimelockContract.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await IFTimelockContract.EXECUTOR_ROLE();
  const ADMIN_ROLE = await IFTimelockContract.DEFAULT_ADMIN_ROLE();

  // Timelock contract grants PROPOSER_ROLE to Governor contract
  // so that Governor contract can call the function queue()
  // to place the proposal into the Timelock contract queue
  let tx = await IFTimelockContract.grantRole(
    PROPOSER_ROLE,
    IFGovernorContract
  );
  await tx.wait();
  console.log(
    `IFTimelockContract grant PROPOSER_ROLE to IFGovernorContract - tx: ${tx.hash}`
  );

  // Timelock contract grants EXECUTOR_ROLE to address of zero
  // so that Governor contract can call the function execute()
  // to have the Timelock contract to run the proposal execution.
  // Eventually, it is the Timelock contract that will run the proposal's execution
  tx = await IFTimelockContract.grantRole(EXECUTOR_ROLE, ADDRESS_ZERO);
  await tx.wait();
  console.log(`Disable EXECUTOR_ROLE of IFTimelockContract - tx: ${tx.hash}`);

  // It is required to pass the ADMIN_ROLE of Timelock contract to a multisig
  tx = await IFTimelockContract.grantRole(ADMIN_ROLE, TIME_LOCK_ADMIN_MULTISIG);
  await tx.wait();
  console.log(
    `IFTimelockContract grant ADMIN_ROLE to a multisig (${TIME_LOCK_ADMIN_MULTISIG}) - tx: ${tx.hash}`
  );

  // Revoke Timelock's ADMIN_ROLE of the deploying account
  tx = await IFTimelockContract.revokeRole(ADMIN_ROLE, deployer);
  await tx.wait();
  console.log(
    `Revoke Timelock's ADMIN_ROLE of the deploying account - tx: ${tx.hash}`
  );

  return {
    PROPOSER_ROLE,
    EXECUTOR_ROLE,
    ADMIN_ROLE,
  };
}

export default setupGovernance;
