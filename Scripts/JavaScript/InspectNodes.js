const Web3 = require("web3");

// connect to the JSON RPC interface at http://localhost:8545
const web3 = new Web3("http://localhost:8545");

async function getNodeData(nodeUrl) {
  const web3 = new Web3(nodeUrl);
  // inspect chain, block information and transaction pool
  const [
    chainId,
    blockNumber,
    peerCount,
    coinbase,
    accounts,
    transactionCount,
  ] = await Promise.all([
    web3.eth.getChainId(),
    web3.eth.getBlockNumber(),
    web3.eth.net.getPeerCount(),
    web3.eth.getCoinbase(),
    web3.eth.getAccounts(),
    web3.eth.getTransactionCount("0xC9C913c8c3C1Cd416d80A0abF475db2062F161f6"),
  ]);
  return {
    nodeUrl,
    chainId,
    blockNumber,
    peerCount,
    coinbase,
    accounts,
    transactionCount,
  };
}

async function main() {
  const nodeUrls = ["http://localhost:8545"];
  const nodeData = await Promise.all(nodeUrls.map(getNodeData));
  console.log(nodeData);
}

main();
