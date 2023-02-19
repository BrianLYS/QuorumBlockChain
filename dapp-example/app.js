const Web3 = require("web3");
const contract = require("truffle-contract");
const Message = contract(require("./build/contracts/Message.json"));

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
Message.setProvider(web3.currentProvider);

web3.eth.getAccounts((error, accounts) => {
  Message.deployed()
    .then((instance) => {
      return instance.setMessage("Hello, world!", { from: accounts[0] });
    })
    .then(() => {
      return Message.deployed().then((instance) => {
        return instance.getMessage.call();
      });
    })
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.error(error);
    });
});
