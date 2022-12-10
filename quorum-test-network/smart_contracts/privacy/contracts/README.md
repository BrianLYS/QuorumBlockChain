## Compile Contract

Run the following code

```
node compile.js
solcjs SimpleStorage.sol --bin --abi
```

## Using eth_sendTransaction

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

## Using web3.eth.Contract

Using the outputs from compiling the contract, create a new file private_tx_web3.js (or run the following commands in a JavaScript console) to send the transaction. The example code uses the Developer Quickstart and sends the transaction from Member1.

## Using priv.generateAndSendRawTransaction

This example uses the web3js-quorum library to make the priv.generateAndSendRawTransaction API call. Create a new file private_tx_web3js_quorum.js(or run the following commands in a JavaScript console) to send the transaction.
