const Web3 = require("web3");

// connect to the JSON RPC interface at http://localhost:8545
const web3 = new Web3("http://localhost:8545");

// get the list of accounts
web3.eth.getAccounts().then((accounts) => {
  console.log(accounts);
});
