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
cd cakeshop/quorum-dev-quickstart
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
