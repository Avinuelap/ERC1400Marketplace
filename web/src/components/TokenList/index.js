import { useState, useEffect } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { List, Button } from "antd";
import addresses from "../../utils/addresses";
import MarketArtifact from "../../utils/Market.json";
import { useMarket } from "../../utils/useMarket";
import styles from "./styles.module.css";

const TokenList = () => {
  const { marketContract } = useMarket(addresses.Market, MarketArtifact.abi);
  const [tokenList, setTokenList] = useState([]);

  console.log("TokenList: ", tokenList);

  useEffect(() => {
    const getTokens = async () => {
      const tokens = await marketContract.getRegisteredTokens();

      // Transformar el array para que tenga un formato de objetos
      const formattedTokens = tokens.map((token) => ({
        tokenAddress: token[0],
        name: token[1],
        symbol: token[2],
        asset: token[3],
        active: token[4],
      }));

      // Filtrar tokens por estado activo
      const activeTokens = formattedTokens.filter((token) => token.active);

      console.log(activeTokens);
      setTokenList(activeTokens);
    };
    if (marketContract) {
      console.log("Loading tokens...");
      getTokens();
    }
  }, [marketContract]);

  return (
    <List
      itemLayout="horizontal"
      style={{ maxWidth: "40%", margin: "0 auto", marginTop: "50px" }}
      header={
        <div
          style={{
            textAlign: "center",
            paddingTop: "10px",
            paddingBottom: "10px",
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: "1.5rem",
              borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
              paddingBottom: "5px", // Opcional: añade un pequeño padding para separar el texto del borde
            }}
          >
            Available tokens
          </span>
        </div>
      }
      dataSource={tokenList}
      size="small"
      renderItem={(token) => (
        <List.Item
          style={{
            color: "white",
            borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <List.Item.Meta
            style={{ color: "white" }}
            title={<span style={{ color: "white" }}>{token.name}</span>}
            description={
              <span style={{ color: "white" }}>
                Symbol: {token.symbol}, Asset: {token.asset}
              </span>
            }
          />
          <div>
            <Button
              style={{
                margin: "0 8px",
                backgroundColor: "rgba(0, 128, 0, 0.1)",
                color: "#4CAF50",
                border: "2px solid #4CAF50",
              }}
            >
              Buy
            </Button>
            <Button
              style={{
                margin: "0 8px",
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                color: "#FF6347",
                border: "2px solid #FF6347",
              }}
            >
              Sell
            </Button>
            <Button type="link" style={{ margin: "0 8px", color: "white" }}>
              Documentation
            </Button>
          </div>
        </List.Item>
      )}
    />
  );
};

export default TokenList;
