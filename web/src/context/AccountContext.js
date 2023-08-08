import { createContext, useState } from "react";

export const AccountContext = createContext();

export const AccountContextProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("test");

  // Check if wallet is connected
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      } else {
        const accounts = await ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
        } else {
          console.log("No authorized account found");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Connect to the wallet
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AccountContext.Provider
      value={{
        currentAccount,
        setCurrentAccount,
        checkIfWalletIsConnected,
        connectWallet
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
