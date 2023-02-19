const Web3 = require("web3");

// connect to the JSON RPC interface at http://localhost:8545
const web3 = new Web3("http://localhost:8545");

// get list of all accounts in network
web3.eth.getAccounts().then((accounts) => {
  console.log(accounts);
});

// create an account with a password
web3.eth.personal.newAccount("password").then((account) => {
  console.log(account);
  // return string of account address
  return account;
});

// create an account with a password
web3.eth.personal.newAccount("password").then((account) => {
  console.log(account);
  // return string of account address
  return account;
});
