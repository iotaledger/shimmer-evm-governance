import { ethers } from "hardhat";
import { CustomActionContract, IFTimelock } from "../typechain-types";

async function deployCustomActionContract(
  IFTimelockContract: IFTimelock
): Promise<CustomActionContract> {
  const [signer] = await ethers.getSigners();
  const deployedCustomActionContract = await ethers.deployContract(
    "CustomActionContract",
    []
  );
  await deployedCustomActionContract.waitForDeployment();

  console.log(
    "CustomActionContract address:",
    await deployedCustomActionContract.getAddress()
  );

  const OPERATOR_ROLE = await deployedCustomActionContract.OPERATOR_ROLE();
  const DEFAULT_ADMIN_ROLE =
    await deployedCustomActionContract.DEFAULT_ADMIN_ROLE();

  const grantOperatorRoleTx = await deployedCustomActionContract.grantRole(
    OPERATOR_ROLE,
    IFTimelockContract
  );
  await grantOperatorRoleTx.wait();
  const grantDefaultAdminRoleTx = await deployedCustomActionContract.grantRole(
    DEFAULT_ADMIN_ROLE,
    IFTimelockContract
  );
  await grantDefaultAdminRoleTx.wait();

  const revokeOperatorRoleTx = await deployedCustomActionContract.revokeRole(
    OPERATOR_ROLE,
    signer
  );
  await revokeOperatorRoleTx.wait();
  const revokeDefaultAdminRoleTx =
    await deployedCustomActionContract.renounceRole(DEFAULT_ADMIN_ROLE, signer);
  await revokeDefaultAdminRoleTx.wait();

  return deployedCustomActionContract;
}

export default deployCustomActionContract;
