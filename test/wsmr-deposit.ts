import { expect } from "chai";
import { ethers } from "hardhat";
import { wSMR } from "../typechain-types";
import deployIFVotesToken from "../deploy/wSMR-token";
import { getBalanceNative } from "../utils";

describe("Test decimal issue of the SMR as native gas token", () => {
  let wSMRTokenContract: wSMR;
  let signer: any;

  it("Reference wSMR token contract", async () => {
    [signer] = await ethers.getSigners();
    wSMRTokenContract = await deployIFVotesToken();
  });

  it("Deposit SMR and check if the deposited SMR value is really deducted from the wallet balance.", async () => {
    // const DEPOSIT_VALUE_IN_WEI = BigInt(1); // 1 wei
    // const DEPOSIT_VALUE_IN_WEI = BigInt(1234567000000000000); // 1.234567 SMR (6 decimals)
    const DEPOSIT_VALUE_IN_WEI = BigInt(1234567800000000000); // 1.2345678 SMR (more than 6 decimals)
    console.log("DEPOSIT_VALUE_IN_WEI:", DEPOSIT_VALUE_IN_WEI);

    const userWalletAddress = await signer.getAddress();
    console.log("userWalletAddress:", userWalletAddress);

    const userBalanceBeforeDeposit = await getBalanceNative(userWalletAddress);
    console.log("userBalanceBeforeDeposit:", userBalanceBeforeDeposit);

    // Depost 1 wei
    const tx = await wSMRTokenContract.connect(signer).deposit({
      value: DEPOSIT_VALUE_IN_WEI,
    });

    const txReceipt = await tx.wait();

    // console.log("txReceipt:", txReceipt);

    const userBalanceAfterDeposit = await getBalanceNative(userWalletAddress);
    console.log("userBalanceAfterDeposit:", userBalanceAfterDeposit);

    const txFee_hardcoded = BigInt(60_058 * (1000 * Math.pow(10, 9)));
    console.log("txFee_hardcoded:", txFee_hardcoded);

    const txFee_fromReceipt =
      BigInt(txReceipt.gasUsed) * BigInt(txReceipt.gasPrice);
    console.log("txFee_fromReceipt:", txFee_fromReceipt);

    expect(
      userBalanceAfterDeposit + DEPOSIT_VALUE_IN_WEI + txFee_fromReceipt
    ).to.equal(userBalanceBeforeDeposit);
  });
});
