# QuorumBlockChain

## Run quorum quick start

```
cd quorum-dev-quickstart
./run.sh

# To Stop
./stop.sh

# To remove all containers and stop
./remove.sh
```

## Run Cakeshop

```
cd /cakeshop-master/quorum-dev-quickstart
docker-compose up -d

# To Stop
docker-compose down
```

# Private Transactions

```
cd smart_contracts/privacy
npm install
node scripts/private_tx.js
```

- In terminal 1, run `./attach.sh 1` to attach to Member1.
- In terminal 2, run `./attach.sh 2` to attach to Member2.
- In terminal 3, run `./attach.sh 3` to attach to Member3.

```
# How it works in order
personal.newAccount("PASSWORD")
personal.unlockAccount("ACCOUNT_ADDRESS", "PASSWORD", 1000)

eth.getTransactionCount("ACCOUNT_ADDRESS")
eth.sendTransaction({from: "FROM_ADDRESS", to: "TO_ADDRESS", value: AMOUNT, gasPrice: GAS_PRICE, gas: GAS_LIMIT})

personal.lockAccount("ACCOUNT_ADDRESS")
```

1. Use the personal.listAccounts method to list all of the accounts on the blockchain network:

   personal.listAccounts()

2. Use the eth.getTransactionCount method to retrieve the number of transactions made by a specific account:

   eth.getTransactionCount("ACCOUNT_ADDRESS")

3. Use the eth.sendTransaction method to send a transaction to the blockchain network:

   eth.sendTransaction({from: "FROM_ADDRESS", to: "TO_ADDRESS", value: AMOUNT, gasPrice: GAS_PRICE, gas: GAS_LIMIT})

4. Disconnect from the blockchain network by typing "exit" in the Geth JavaScript console.

# Smart contract

## Compile Contract

Create compile.js under QuorumBlockChain/quorum-test-network/smart_contracts/privacy

```
const fs = require('fs').promises;
const solc = require('solc');

async function main() {
  // Load the contract source code
  const sourceCode = await fs.readFile('SimpleStorage.sol', 'utf8');
  // Compile the source code and retrieve the ABI and bytecode
  const { abi, bytecode } = compile(sourceCode, 'SimpleStorage');
  // Store the ABI and bytecode into a JSON file
  const artifact = JSON.stringify({ abi, bytecode }, null, 2);
  await fs.writeFile('SimpleStorage.json', artifact);
}

function compile(sourceCode, contractName) {
  // Create the Solidity Compiler Standard Input and Output JSON
  const input = {
    language: 'Solidity',
    sources: { main: { content: sourceCode } },
    settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } },
  };
  // Parse the compiler output to retrieve the ABI and bytecode
  const output = solc.compile(JSON.stringify(input));
  const artifact = JSON.parse(output).contracts.main[contractName];
  return {
    abi: artifact.abi,
    bytecode: artifact.evm.bytecode.object,
  };
}

main().then(() => process.exit(0));
```

Run the following code

```
node compile.js
solcjs SimpleStorage.sol --bin --abi
```

## Private contracts

### 1. Using eth_sendTransaction

Call eth_sendTransaction with the following parameters:

- from - Address of the sender’s account.
- to - Address of the receiver. To deploy a contract, set to null.
- gas - Amount of gas provided by the sender for the transaction.
- gasPrice - Price for each unit of gas. Set to zero in GoQuorum networks.
- privateFrom - The sender’s base-64-encoded public key.
- privateFor - Array of the recipient’s base-64-encoded public keys.
- privacyFlag - 0 for standard private, 1 for counter party protection. and 3 for private state validation.
- data - One of the following:
- For contract deployments (this use case), the compiled binary of the contract.
- For contract interactions, the hash of the invoked method signature and encoded parameters (see Ethereum Contract ABI).
- For simple ether transfers, empty.
- Example eth_sendTransaction curl HTTP request

```
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_sendTransaction","params":[{"from":"0xf0e2db6c8dc6c681bb5d6ad121a107f300e9b2b5", "to":null, "gas":"0x24A22","gasPrice":"0x0", "privateFrom": "BULeR8JyUWhiuuCMU/HLA0Q5pzkYT+cHII3ZKBey3Bo=", "privateFor": ["1iTZde/ndBHvzhcl7V68x44Vx7pl8nwx9LqnM/AfJUg="], "privacyFlag": 0,"data":"0x608060405234801561001057600080fd5b5060405161014d38038061014d8339818101604052602081101561003357600080fd5b8101908080519060200190929190505050806000819055505060f38061005a6000396000f3fe6080604052348015600f57600080fd5b5060043610603c5760003560e01c80632a1afcd914604157806360fe47b114605d5780636d4ce63c146088575b600080fd5b604760a4565b6040518082815260200191505060405180910390f35b608660048036036020811015607157600080fd5b810190808035906020019092919050505060aa565b005b608e60b4565b6040518082815260200191505060405180910390f35b60005481565b8060008190555050565b6000805490509056fea2646970667358221220e6966e446bd0af8e6af40eb0d8f323dd02f771ba1f11ae05c65d1624ffb3c58264736f6c63430007060033"}], "id":1}' -H 'Content-Type: application/json' http://localhost:20000
```

If using the Quorum Developer Quickstart, use the from address and RPC endoint of Member1.\
For more information how on using priv.generateAndSendRawTransaction and using web3.eth.Contract:\
README.md at /quorum-test-network/smart_contracts/privacy/contracts
