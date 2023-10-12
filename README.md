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
