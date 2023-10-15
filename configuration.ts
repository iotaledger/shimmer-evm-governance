// Minimum Timelock delay in seconds operations after the proposal passes
export const TIME_LOCK_MIN_DELAY = 3 * 24 * 60 * 60; // 3 days

// ADMIN_ROLE of Timelock contract will be under this specified multisig wallet
export const TIME_LOCK_ADMIN_MULTISIG =
  "0x57bA4DBea3198e48af45117e93e2abb9822BEA48";

// Multisig address that can create the proposals
export const PROPOSER_1_MULTISIG = "0x57A4bD139Fb673D364A6f12Df9177A3f686625F3";
export const PROPOSER_2_MULTISIG = "0x5e812d3128D8fD7CEac08CEca1Cd879E76a6E028";

// Governor Values
export const PROPOSAL_QUORUM_FIXED_AMOUNT = 45_000_000; // 45 millions of wSMR tokens
export const PROPOSAL_VOTING_PERIOD = 7 * 24 * 60 * 60; // 7 days
// No voting delay so that snapshot happens immediately
// This requires the users to delegate for voting power before the proposal is created
export const PROPOSAL_VOTING_DELAY = 0;
// No proposal threshold, only whitelisted account addresses can create proposal
export const PROPOSAL_THRESHOLD = 0;

// Voting period extension after quorum is reached. This prevents a large voter from
// swaying a vote and triggering quorum at the last minute, by ensuring there is always time for other voters to react.
// The final proposal voting period will be the max between the remaining voting period (PROPOSAL_VOTING_PERIOD)
// and the late quorum extension (PROPOSAL_LATE_QUORUM_EXTENSION)
// For example, if the remaining voting period is 5 hours and the big vote arrives then the voting period will be changed to 24 hours.
// However, if the remaining voting period is 25 hours and the big vote arrives then the voting period will still remain to 25 hours.
// This is because the remaining voting period is still more than the extension.
// For short, if the late quorum extension is set to be 24 hours, this means that within the last 24 hours of the voting period
// if any big vote comes, the voting period will be extended by 24 hours more from the current time.
export const PROPOSAL_LATE_QUORUM_EXTENSION = 24 * 60 * 60; // 24 hours

// This should not be changed
export const wSMR_SHIMMER_EVM_MAINNET =
  "0xBEb654A116aeEf764988DF0C6B4bf67CC869D01b";
