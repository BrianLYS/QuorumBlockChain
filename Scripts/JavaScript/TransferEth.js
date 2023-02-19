const Web3 = require("web3");

// connect to the JSON RPC interface at http://localhost:8545
const web3 = new Web3("http://localhost:8545");

// transfer 1 ETH from one account to another
web3.eth
  .sendTransaction({
    from: "0xC9C913c8c3C1Cd416d80A0abF475db2062F161f6",
    to: "0x6e088bc16a6cAEBe475CE7d946409240845593dC",
    value: web3.utils.toWei("1", "ether"),
  })
  .then((receipt) => {
    console.log(receipt);
  });
