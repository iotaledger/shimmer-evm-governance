import { network, ethers } from "hardhat";

export async function getBalanceNative(accountAddress: string) {
  return ethers.provider.getBalance(accountAddress);
}

export function toWei(val: string | number) {
  return ethers.parseUnits(String(val), "ether");
}
