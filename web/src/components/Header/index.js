import { useContext } from "react";
import { AccountContext } from "../../context/AccountContext";
import styles from "./styles.module.css";
import { Space } from "antd";

function Header() {
  const {
    currentAccount,
    checkIfWalletIsConnected,
    connectWallet,
  } = useContext(AccountContext);

  return (
    <div className={styles.header}>
      <Space align="center" size={700}>
        <h1>Security Token Marketplace</h1>
        {!currentAccount && <button className={styles.buttonMetamask} onClick={connectWallet}>
          Conectar MetaMask
        </button> }
      </Space>
    </div>
  );
}

export default Header;
