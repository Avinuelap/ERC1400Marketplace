import { useState, useEffect, useContext } from "react";
import { constants, utils } from "ethers";
import { List, Button, Modal, Form, Input, InputNumber } from "antd";
import { AccountContext } from "../../context/AccountContext";
import addresses from "../../utils/addresses";
import MarketArtifact from "../../utils/Market.json";
import USDTArtifact from "../../utils/USDT.json";
import { useMarket } from "../../utils/useMarket";
import { useUSDT } from "../../utils/useUSDT";
import styles from "./styles.module.css";

const TokenList = () => {
  const { marketContract } = useMarket(addresses.Market, MarketArtifact.abi);
  const { usdtContract } = useUSDT(addresses.USDT, USDTArtifact.abi);
  const { currentAccount } = useContext(AccountContext);

  const [tokenList, setTokenList] = useState([]);

  const [visible, setVisible] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [buyAmount, setBuyAmount] = useState(0);
  const [buyPrice, setBuyPrice] = useState(0);

  useEffect(() => {
    const getTokens = async () => {
      const tokens = await marketContract.getRegisteredTokens();

      const formattedTokens = tokens.map((token) => ({
        tokenAddress: token[0],
        name: token[1],
        symbol: token[2],
        asset: token[3],
        active: token[4],
      }));

      const activeTokens = formattedTokens.filter((token) => token.active);
      setTokenList(activeTokens);
    };

    if (marketContract) {
      getTokens();
    }
  }, [marketContract]);

  async function approveUSDT() {
    console.log("Aprobando USDT...");

    try {
      await usdtContract.approve(currentAccount, constants.MaxUint256);
    } catch (error) {
      console.log(error);
    }
  }

  const showModal = (token) => {
    setSelectedToken(token);
    setVisible(true);
  };

  const handleCancel = () => {
    setBuyAmount(0);
    setBuyPrice(0);
    setSelectedToken(null);
    setVisible(false);
  };

  const handleAmountChange = (value) => {
    setBuyAmount(value);
  };

  const handlePriceChange = (event) => {
    setBuyPrice(event.target.value);
  };

  const handleBuyToken = async () => {
    try {
      await marketContract.placeBuyOrder(
        buyAmount,
        utils.parseUnits(buyPrice, "18"), // 18 decimals
        selectedToken.tokenAddress
      );
      console.log("Buy order placed successfully");
      // Cerrar modal y resetear valores
      handleCancel();
    } catch (error) {
      console.error("Error placing the buy order:", error);
    }
  };

  return (
    <>
      <List
        itemLayout="horizontal"
        style={{ maxWidth: "40%", margin: "0 auto", marginTop: "50px" }}
        header={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between", // Esto se encargará de separar el título y el botón
              alignItems: "center",
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
                paddingBottom: "5px",
              }}
            >
              Available tokens
            </span>
            <Button
              onClick={approveUSDT}
              style={{
                backgroundColor: "#1890ff",
                color: "white",
                border: "none",
              }}
            >
              Approve USDT
            </Button>
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
                onClick={() => showModal(token)}
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

      <Modal
        title={`Buy ${selectedToken?.name || ""}`}
        open={visible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Quantity">
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter quantity"
              value={buyAmount !== 0 ? buyAmount : undefined}
              onChange={handleAmountChange}
            />
          </Form.Item>
          <Form.Item label="Price">
            <Input
              prefix="$USDT"
              placeholder="Enter price"
              value={buyPrice !== 0 ? buyPrice : undefined}
              onChange={handlePriceChange}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" block onClick={handleBuyToken}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TokenList;
