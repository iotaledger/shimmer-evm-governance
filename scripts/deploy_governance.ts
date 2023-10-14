import type { BaseContract } from "ethers";
import { network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import deployIFGovernor from "../deploy/if-governor";
import deployWSMRToken from "../deploy/wSMR-token";
import deployIFTimelock from "../deploy/if-timelock";
import setupGovernance from "../deploy/setup-governance";

async function storeDeployedContractAddressList(
  contracts: Array<BaseContract>
) {
  const [
    deployedIFVotesTokenContract,
    deployedIFTimelockContract,
    deployedIFGovernorContract,
  ] = contracts;

  const deployedContractAddressList: Object = {
    network: network.name,
    chainId: network.config.chainId,
    IFGovernor: await deployedIFGovernorContract.getAddress(),
    wSMR: await deployedIFVotesTokenContract.getAddress(),
    IFTimelock: await deployedIFTimelockContract.getAddress(),
  };

  const contractsDir: string = path.join(
    __dirname,
    "/..",
    `deployed-contract-address/${network.name}`
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "/", "deployedContractAddressList.json"),
    JSON.stringify(deployedContractAddressList)
  );
}

async function main() {
  // Deploy contracts
  const deployedIFVotesTokenContract = await deployWSMRToken();
  const deployedIFTimelockContract = await deployIFTimelock();
  const deployedIFGovernorContract = await deployIFGovernor(
    deployedIFVotesTokenContract,
    deployedIFTimelockContract
  );

  // Setup governance
  await setupGovernance(deployedIFTimelockContract, deployedIFGovernorContract);

  // Store the deployed contract addresses
  await storeDeployedContractAddressList([
    deployedIFVotesTokenContract,
    deployedIFTimelockContract,
    deployedIFGovernorContract,
  ]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
