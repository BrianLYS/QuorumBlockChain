pragma solidity ^0.8.0;

contract SimpleContract {
    // Define a variable to store the contract's state
    bool public isCompleted = false;

    // Define the function that can be called by external accounts to set the state of the contract
    function setCompleted() public {
        isCompleted = true;
    }

    // Define a function that can be called by external accounts to check the state of the contract
    function checkCompleted() public view returns (bool) {
        return isCompleted;
    }
}


/*
After the contract is deployed, external accounts can interact with it by calling its functions and sending transactions to it. 
For example, an external account can call the setCompleted function to set the state of the contract, and then call the checkCompleted function to check its
state.
*/