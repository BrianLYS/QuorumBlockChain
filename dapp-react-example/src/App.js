import React, { useEffect, useState } from "react";
import Web3 from "web3";
import Message from "./Message.json";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Connect to the Quorum blockchain
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

    // Get the current account
    web3.eth.getAccounts().then((accounts) => {
      setAccount(accounts[0]);
    });

    // Get the contract instance
    const contractAddress = "YOUR_CONTRACT_ADDRESS";
    const contract = new web3.eth.Contract(Message.abi, contractAddress);

    setWeb3(web3);
    setContract(contract);
  }, []);

  // Function to get the current message from the contract
  const getMessage = async () => {
    const response = await contract.methods.message().call();
    setMessage(response);
  };

  // Function to set a new message in the contract
  const setNewMessage = async (newMessage) => {
    const response = await contract.methods
      .setMessage(newMessage)
      .send({ from: account });
    console.log(response);
  };

  return (
    <div>
      <h1>My DAPP</h1>
      <p>Current message: {message}</p>
      <button onClick={() => getMessage()}>Get message</button>
      <br />
      <input
        type="text"
        value={Message}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={() => setNewMessage(Message)}>Set message</button>
    </div>
  );
};

export default App;
