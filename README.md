# Community Treasury Governance (EVM - based)

## Introduction

On-chain governance for SMR token holders in the Shimmer EVM Chain.

To make it secure and transparent for the Shimmer Community to control and access the Tokens in its Treasury, it is necessary to implement a Governance system based on Smart Contracts to vote on and execute funds transfers from the smart contract that holds the Community Treasury Tokens.

The Governance system, which will run on the ShimmerEVM network, includes smart contracts based on [OpenZeppelin open source libraries](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/governance) and uses [Tally](https://www.tally.xyz/) to provide a user-friendly interface that facilitates the governance operations.

To participate in Governance, SMR tokens from L1 must be deposited in the Shimmer EVM Chain to receive the SMR tokens on the user's L2 Account. This can be done via the Firefly wallet.
After that, the SMR tokens on L2 need to be wrapped into wSMR tokens as the governance token. The wrapping functionality will be provided by the [Shimmer EVM toolkit application](https://evm-toolkit.evm.shimmer.network/)

The wrapping of a user's SMR tokens is necessary because only wSMR tokens include the necessary `ERC20votes` extension that enables Governance functionalities:

> This extension keeps a history (checkpoints) of each account's vote power. Vote power can be delegated by calling the delegate function directly or providing a signature to be used with **`delegateBySig`**. Voting power can be queried through the public accessors **`getVotes`** and **`getPastVotes`**

The wSMR tokens can be unwrapped back into the SMR tokens.

## Installation

`npm i`

## Configuration

- The deployer account private key is configured in `.env` that is renamed from the template `.env.example`.

- Contract deployment parameters are configured in `configuration.ts`.

## Governance deployment

This is implemented in the file `scripts\deploy_governance.ts` where **governance setup** is implemented in the file `deploy\setup-governance.ts`.

### Deploy to local Hardhat

`npm run deploy-hardhat`

The deployed contract addresses are stored in the folder `deployed-contract-address\hardhat`

### Deploy to ShimmerEVM testnet

`npm run deploy-shimmerEvmTestnet`

The deployed contract addresses are stored in the folder `deployed-contract-address\shimmerEvmTestnet`

### Deploy to ShimmerEVM mainnet

`npm run deploy-shimmerEvmMainnet`

The deployed contract addresses are stored in the folder `deployed-contract-address\shimmerEvmMainnet`

## Unit-test

`npm run test`

## Notice

### Proposal state and cancellation

- If the proposal is still active, any attempt to queue/execute/cancel it will revert.
- The proposal can only be cancelled via Governor contract if it is still in voting delay (i.e. not yet active for voting).
- If proposal passes the voting, it can only be cancelled by the Timelock.

### Proposal late quorum extension

- Upon the big vote that causes the quorum to be reached, the extended deadline of the proposal voting duration will be recorded
  to be the time point of the big vote plus the specified PROPOSAL_LATE_QUORUM_EXTENSION.
- The final proposal voting period will be the `max` between the `remaining` voting period (PROPOSAL_VOTING_PERIOD) and the late quorum extension (PROPOSAL_LATE_QUORUM_EXTENSION).
- For example, suppose the PROPOSAL_LATE_QUORUM_EXTENSION is 24 hours, if the remaining voting period is 5 hours and the big vote arrives then the voting period will be changed to 24 hours. However, if the remaining voting period is 25 hours and the big vote arrives then the voting period will still remain to 25 hours. This is because the remaining voting period is still more than the extension.
- For short, if the late quorum extension is set to be 24 hours, this means that within the last 24 hours of the voting period, if any big vote comes, the voting period will be 24 hours more from the current time.

## Unit-test result

```
> if-governance@1.0.0 test
> npx hardhat test



  IF governance test of proposal creation for changing governance settings
    ✔ Deploy governance contracts (1356ms)
    ✔ Setup governance (91ms)
    ✔ Verify wSMR total supply after users have deposited (56ms)
    ✔ Verify IFGovernor contract property
    ✔ Create proposal to change governance settings including timelock delay, quorum fixed amount, voting period, voting delay, proposal threshold and late quorum extension (84ms)
    ✔ Vote the created proposal. If proposal still active, any attempt to queue/execute/cancel it will revert. (159ms)
    ✔ Queue & Execute the proposal (165ms)
    ✔ Verify the newly-changed governance settings
    ✔ Governance settings change will revert if not via proposal execution (43ms)

  IF governance test of proposal creation for transferring native SMR with late quorum extension
    ✔ Deploy governance contracts (95ms)
    ✔ Setup governance (57ms)
    ✔ Verify wSMR total supply after users have deposited (56ms)
    ✔ Create proposal to transfer native SMR to the specified RECIPIENT_NATIVE_SMR (56ms)
    ✔ Big vote on the proposal to make it reach the quorum. Verify the voting period extension (78ms)
    ✔ Queue & Execute the proposal (90ms)

  IF governance test of proposal creation for transferring native SMR
    ✔ Deploy governance contracts (91ms)
    ✔ Setup governance (53ms)
    ✔ Verify wSMR total supply after users have deposited (52ms)
    ✔ Verify IFGovernor contract property
    ✔ Any attempt to create proposal from not whitelisted address will fail.
    ✔ Create proposal to transfer native SMR to the specified RECIPIENT_NATIVE_SMR (39ms)
    ✔ Vote the created proposal. If proposal still active, any attempt to queue/execute/cancel it will revert. (91ms)
    ✔ Queue & Execute the proposal (74ms)
    ✔ Governance settings change will revert if not via proposal execution


  24 passing (3s)
```
