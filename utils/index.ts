import { network, ethers } from "hardhat";

export async function increaseTime(amountSec: number) {
  await network.provider.send("evm_increaseTime", [amountSec]);
}

export async function mineBlocks(amount: number) {
  for (let index = 0; index < amount; ++index) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
}

export async function getBalanceNative(accountAddress: string) {
  return ethers.provider.getBalance(accountAddress);
}
