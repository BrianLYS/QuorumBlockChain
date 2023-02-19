# How to run

```
npm install
truffle compile
truffle migrate
node app.js
```

## Basic DAPP

This DAPP allows users to submit a message to the blockchain. It is stored in a contract and can be retrieved by anyone.
Created initially by `truffle init` command.

It consists of:

1. Message.sol in contracts dir;\
   Has 2 functions setMessage and getMessage

2. 2_deploy_contracts.js in the migrations dir;\
   This file tells Truffle to deploy the Message contract to the blockchain.\

3. app.js in the root directory;\
   This code uses the Web3 library to connect to the Quorum blockchain and interact with the Message contract. It sets the message to "Hello, world!", and then retrieves it from the contract and logs it to the console.

## To create a DAPP that works with the Quorum quick start, you will need to use the following tools and frameworks:

Ethereum:\
Quorum is based on the Ethereum blockchain, so you will need to use Ethereum tools and libraries for DAPP development. This includes the Solidity programming language for writing smart contracts, and the Truffle framework for managing and deploying contracts.

Web3.js:\
This is a library for interacting with the Ethereum blockchain from within a web browser or Node.js application. It allows you to send transactions, query the blockchain, and perform other operations on the Ethereum network.

React:\
JavaScript library; Use React to create the frontend of your DAPP, which will allow users to interact with the smart contracts on the Quorum blockchain.

Mocha:\
JavaScript test framework; you can use to write automated tests for your DAPP and smart contracts.

Ganache:\
This is a local Ethereum blockchain that you can use for testing and development purposes. It allows you to deploy contracts and perform transactions without having to connect to the main Ethereum network.

## To develop your DAPP and smart contracts, you will need to follow these steps:

Write your smart contracts using Solidity and test them using Mocha and Ganache.

Use Truffle to deploy your contracts to the Quorum blockchain.

Use React to build the frontend of your DAPP, which will allow users to interact with the smart contracts on the Quorum blockchain.

Test your DAPP and contracts thoroughly using automated tests and manual testing to ensure that they are working as expected.

Deploy your DAPP to a web server or hosting platform so that it can be accessed by users.

By following these steps, you should be able to create a DAPP that works with the Quorum quick start and utilizes the necessary tools and frameworks for DAPP and smart contract development and automated testing.
