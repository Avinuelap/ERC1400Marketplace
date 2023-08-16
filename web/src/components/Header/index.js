import { useContext } from "react";
import { useRouter } from "next/navigation";
import { AccountContext } from "../../context/AccountContext";
import styles from "./styles.module.css";
import { Space } from "antd";

function Header() {
  const router = useRouter();
  const { currentAccount, connectWallet } = useContext(AccountContext);

  const navigateToHome = () => {
    router.push("/");
  };

  const navigateToListToken = () => {
    router.push("/minter");
  };

  const navigateToMarketplace = () => {
    router.push("/market");
  };

  return (
    <div className={styles.header}>
      <Space align="center" size={600}>
        <h1 className={styles.title} onClick={navigateToHome}>
          Security Token Marketplace
        </h1>
        {/*!currentAccount && <button className={styles.buttonMetamask} onClick={connectWallet}>
          Conectar MetaMask
        </button> */}
      </Space>
      <div className={styles.mainDiv}>
        <p onClick={navigateToListToken}> List Token </p>
        <p onClick={navigateToMarketplace}> Marketplace </p>
      </div>
    </div>
  );
}

export default Header;
