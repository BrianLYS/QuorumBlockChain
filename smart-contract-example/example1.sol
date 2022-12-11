pragma solidity ^0.8.0;

contract SimpleContract {
    uint public balance;

    constructor() public {
        balance = 0;
    }

    function addFunds(uint _value) public {
        balance += _value;
    }

    function withdrawFunds(uint _value) public {
        require(balance >= _value, "Not enough funds to withdraw.");
        balance -= _value;
    }
}

/*
This contract has a public variable balance that stores the current balance of the contract. It has two functions: addFunds and withdrawFunds. The addFunds function allows anyone to add funds to the contract by calling the function and passing in the value to add. The withdrawFunds function allows anyone to withdraw funds from the contract by calling the function and passing in the value to withdraw. However, the withdrawFunds function includes a require statement that checks if the contract has enough funds to withdraw. If it does not, the function will revert and not allow the funds to be withdrawn.

To compile this contract, you can use a Solidity compiler like solc. Once the contract is compiled, it can be deployed to a blockchain network, such as the Ethereum mainnet or a testnet like Rinkeby, using a tool like truffle.

After the contract is deployed, you can interact with it using a blockchain wallet or a tool like web3.js. For example, you can call the addFunds and withdrawFunds functions to add and withdraw funds from the contract.
*/