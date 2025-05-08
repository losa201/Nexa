require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.17",
  networks: {
    devnet: {
      url: "http://127.0.0.1:8545",
      // if you want to use specific accounts, you can set:
      // accounts: ["0xYOUR_PRIVATE_KEY", ...]
    }
  }
};
