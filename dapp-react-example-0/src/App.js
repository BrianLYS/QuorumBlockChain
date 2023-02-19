import { useState, useEffect } from "react";
import Web3 from "web3";
import "./App.css";
import Message from "./Message.json";

function App() {
  const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
  console.log(web3);

  // get accounts
  const [account, setAccount] = useState("");
  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    };
    getAccount();
  }, []);

  // get balance
  const [balance, setBalance] = useState("");
  useEffect(() => {
    const getBalance = async () => {
      const balance = await web3.eth.getBalance(account);
      setBalance(balance);
    };
    getBalance();
  }, [account]);

  // get contract from account
  const [contract, setContract] = useState(null);
  useEffect(() => {
    const getContract = async () => {
      const contract = new web3.eth.Contract(
        Message.abi,
        Message.networks[5777].address
      );
      setContract(contract);
    };
    getContract();
  }, []);

  // get message
  const [message, setMessage] = useState("");
  useEffect(() => {
    const getMessage = async () => {
      const message = await contract.methods.message().call();
      setMessage(message);
    };
    getMessage();
  }, [contract]);

  // set message
  const setMessage1 = async (newMessage) => {
    const response = await contract.methods
      .setMessage(newMessage)
      .send({ from: account });
    console.log(response);
  };

  return (
    <div className="App">
      <header className="App-header">
        DAPP is live!{" "}
        <p>
          Your Account: {account} <br></br> Your Balance: {balance} <br></br>{" "}
          Set Message:{" "}
          <input type="text" onChange={(e) => setMessage(e.target.value)} />{" "}
          <button onClick={() => setMessage1(message)}>Set Message</button>{" "}
          <br></br> Current Message: {message}{" "}
        </p>
      </header>
    </div>
  );
}

export default App;
