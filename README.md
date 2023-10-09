# IF Governance

## Introduction

On-chain governance for SMR tokens.

To make it secure and transparent for the Community Treasury of the SMR tokens, it is needed to implement the Governance system for the funds transfer.
The Governance system, which will run on the ShimmerEVM network, includes the smart contract based on OpenZeppelin opensource (https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/governance) and Tally (https://www.tally.xyz/) which provides user-friendly interface that facilitates the governance operations.

The SMR tokens on L1 need to be deposited to get the SMR tokens on L2. This can be done via the Firefly wallet.
After that, the SMR tokens on L2 need to be wrapped into wSMR tokens as the governance token.
The wSMR tokens can be unwrapped back into the SMR tokens.

## Installation

`npm i`
