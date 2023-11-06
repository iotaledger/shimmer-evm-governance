import { expect } from "chai";
import { ethers } from "hardhat";
import { wSMR } from "../typechain-types";
import deployIFVotesToken from "../deploy/wSMR-token";
import { getBalanceNative } from "../utils";

describe("Deposit 1 wei to get wSMR token", () => {
  let wSMRTokenContract: wSMR;
  let signer: any;

  it("Reference wSMR token contract", async () => {
    [signer] = await ethers.getSigners();
    wSMRTokenContract = await deployIFVotesToken();
  });

  it("Deposit 1 wei and check SMR balance before/after to see that 1 wei is discarded.", async () => {
    const ONE_WEI = BigInt(1);
    const userWalletAddress = await signer.getAddress();
    console.log("userWalletAddress:", userWalletAddress);

    const userBalanceBeforeDeposit = await getBalanceNative(userWalletAddress);
    // console.log("userBalanceBeforeDeposit:", userBalanceBeforeDeposit);

    // Depost 1 wei
    await wSMRTokenContract.connect(signer).deposit({
      value: ONE_WEI,
    });

    const userBalanceAfterDeposit = await getBalanceNative(userWalletAddress);
    // console.log("userBalanceAfterDeposit:", userBalanceAfterDeposit);

    // const userBalanceWSMRTokens = await wSMRTokenContract.balanceOf(
    //   userWalletAddress
    // );
    // console.log(
    //   "userBalanceWSMRTokens:",
    //   userBalanceWSMRTokens / BigInt(Math.pow(10, 18))
    // );

    const txFee = BigInt(60_058 * (1000 * Math.pow(10, 9)));

    // Always failed because 1 wei is discarded
    expect(userBalanceAfterDeposit + ONE_WEI + txFee).to.equal(
      userBalanceBeforeDeposit
    );
  });
});
