// Minimum Timelock delay in seconds operations after the proposal passes
export const TIME_LOCK_MIN_DELAY = 1 * 60 * 60; // 1 hour

// ADMIN_ROLE of Timelock contract will be under this specified multisig wallet
export const TIME_LOCK_ADMIN_MULTISIG =
  "0x57bA4DBea3198e48af45117e93e2abb9822BEA48";

// Multisig address that can create the proposals
export const PROPOSER_1_MULTISIG = "0x57A4bD139Fb673D364A6f12Df9177A3f686625F3";
export const PROPOSER_2_MULTISIG = "0x5e812d3128D8fD7CEac08CEca1Cd879E76a6E028";

// Governor Values
export const PROPOSAL_QUORUM_FIXED_AMOUNT = 5; // 5 wSMR tokens (18 decimals)
export const PROPOSAL_VOTING_PERIOD = 7 * 24 * 60 * 60; // 7 days
// No voting delay so that snapshot happens immediately
// This requires the users to delegate for voting power before the proposal is created
export const PROPOSAL_VOTING_DELAY = 0;
// No proposal threshold, only whitelisted account addresses can create proposal
export const PROPOSAL_THRESHOLD = 0;

// Voting period extension after quorum is reached. This prevents a large voter from
// swaying a vote and triggering quorum at the last minute, by ensuring there is always time for other voters to react
export const PROPOSAL_LATE_QUORUM_EXTENSION = 24 * 60 * 60; // 24 hours
