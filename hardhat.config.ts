import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";

const SHIMMER_EVM_TESTNET_RPC_URL =
  "https://json-rpc.evm.testnet.shimmer.network";

const SHIMMER_EVM_MAINNET_RPC_URL = "https://json-rpc.evm.shimmer.network";

module.exports = {
  defaultNetwork: "hardhat",
  gasReporter: {
    enabled: true,
  },
  networks: {
    hardhat: { chainId: 31337 },
    shimmerEvmTestnet: {
      chainId: 148,
      url: SHIMMER_EVM_TESTNET_RPC_URL,
      accounts: [`${process.env.DEPLOYER_ACCOUNT_PRIV_KEY}`],
    },
    shimmerEvmMainnet: {
      chainId: 148,
      url: SHIMMER_EVM_MAINNET_RPC_URL,
      accounts: [`${process.env.DEPLOYER_ACCOUNT_PRIV_KEY}`],
    },
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};
