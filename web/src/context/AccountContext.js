import { createContext, useState, useEffect } from "react";

export const AccountContext = createContext();

export const AccountContextProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState(null);

  // Check if wallet is connected. If connected, set currentAccount to the connected account
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      } else {
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account); // Solo aquí se actualiza el estado de currentAccount
        } else {
          console.log("No authorized account found");
          setCurrentAccount(null); // Establecer a null si no se encuentra una cuenta autorizada
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

  // Check if wallet is connected on startup
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  // Check if wallet is connected when metamask account changes
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum && ethereum.on && ethereum.removeListener) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length !== 0) {
          setTimeout(async () => {
            await checkIfWalletIsConnected();
          }, 500); // espera medio segundo antes de verificar
        } else {
          console.log("Please connect to MetaMask.");
          setCurrentAccount(null);
        }
      };

      ethereum.on("accountsChanged", handleAccountsChanged);

      return () =>
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
    }
  }, []);

  // Return the context provider
  return (
    <AccountContext.Provider
      value={{
        currentAccount,
        setCurrentAccount,
        checkIfWalletIsConnected,
        connectWallet,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
