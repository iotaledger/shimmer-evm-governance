import { network, ethers } from "hardhat";

export async function getBalanceNative(accountAddress: string) {
  return ethers.provider.getBalance(accountAddress);
}
