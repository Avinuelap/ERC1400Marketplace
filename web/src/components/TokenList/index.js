import { useState, useEffect, useContext } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { ethers } from "ethers";
import { constants } from "ethers";
import { List, Button, Modal, Form, Input, InputNumber } from "antd";
import { AccountContext } from "../../context/AccountContext";
import addresses from "../../utils/addresses";
import MarketArtifact from "../../utils/Market.json";
import USDTArtifact from "../../utils/USDT.json";
import SecurityToken from "../../utils/SecurityToken.json";
import { useMarket } from "../../utils/useMarket";
import { useUSDT } from "../../utils/useUSDT";
import styles from "./styles.module.css";

const TokenList = () => {
  const { marketContract } = useMarket(addresses.Market, MarketArtifact.abi);
  const { usdtContract } = useUSDT(addresses.USDT, USDTArtifact.abi);

  const [tokenList, setTokenList] = useState([]);
  const [tokenContracts, setTokenContracts] = useState({});

  const [buyVisible, setBuyVisible] = useState(false);
  const [sellVisible, setSellVisible] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [action, setAction] = useState(null);
  const [buyAmount, setBuyAmount] = useState(0);
  const [buyPrice, setBuyPrice] = useState(0);
  const [sellAmount, setSellAmount] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);

  // Similar al hook de useContract, pero es una función asincrónica regular. Para evitar problemas.
  async function initializeSecurityToken(contractAddress, contractAbi) {
    if (!contractAddress || !contractAbi) return null;
    if (typeof window.ethereum !== "undefined") {
      const provider = new Web3Provider(window.ethereum, "any");
      const signer = provider.getSigner();
      return new ethers.Contract(contractAddress, contractAbi, signer);
    } else {
      alert("No ethereum provider found. Please install metamask!");
      return null;
    }
  }
  useEffect(() => {
    const getTokens = async () => {
      const tokens = await marketContract.getRegisteredTokens();

      const formattedTokens = tokens.map((token) => ({
        tokenAddress: token[0],
        name: token[1],
        symbol: token[2],
        asset: token[3],
        docURL: token[4],
        active: token[5],
      }));

      const activeTokens = formattedTokens.filter((token) => token.active);
      setTokenList(activeTokens);

      // Inicializa los contratos para cada token
      const newTokenContracts = {};
      for (const token of formattedTokens) {
        newTokenContracts[token.tokenAddress] = await initializeSecurityToken(
          token.tokenAddress,
          SecurityToken.abi
        );
      }
      setTokenContracts(newTokenContracts);
    };

    if (marketContract) {
      getTokens();
    }
  }, [marketContract]);

  async function approveUSDT() {
    console.log(`Aprobando USDT...`);

    try {
      await usdtContract.approve(addresses.Market, constants.MaxUint256);
    } catch (error) {
      console.log(error);
    }
  }

  async function approveToken(tokenAddress) {
    const contract = tokenContracts[tokenAddress];
    if (!contract) {
      console.log(`Contrato para el token ${tokenAddress} no encontrado`);
      return;
    }

    console.log(`Aprobando token: ${tokenAddress}...`);
    try {
      await contract.approve(addresses.Market, constants.MaxUint256);
      console.log(`Token ${tokenAddress} aprobado exitosamente.`);
    } catch (error) {
      console.log(`Error al aprobar el token: ${error}`);
    }
  }

  const showModal = (token, action) => {
    setSelectedToken(token);
    setAction(action);
    if (action === "buy") {
      setBuyVisible(true);
    } else if (action === "sell") {
      setSellVisible(true);
    }
  };

  const handleCancel = () => {
    setBuyAmount(0);
    setBuyPrice(0);
    setSellAmount(0);
    setSellPrice(0);
    setSelectedToken(null);
    setBuyVisible(false);
    setSellVisible(false);
  };

  const handleAmountChange = (value) => {
    if (action === "buy") {
      setBuyAmount(value);
    } else if (action === "sell") {
      setSellAmount(value);
    }
  };

  const handlePriceChange = (event) => {
    if (action === "buy") {
      setBuyPrice(event.target.value);
    } else if (action === "sell") {
      setSellPrice(event.target.value);
    }
  };

  const handleBuyToken = async () => {
    try {
      const convertedBuyAmount = buyAmount + "000000000000000000";
      const convertedBuyPrice = buyPrice + "000000000000000000";
      console.log(
        `Placing buy order for ${buyAmount} tokens at ${buyPrice}$ each`
      );
      await marketContract.placeBuyOrder(
        convertedBuyAmount,
        convertedBuyPrice,
        selectedToken.tokenAddress
      );
      console.log("Buy order placed successfully");
      // Cerrar modal y resetear valores
      handleCancel();
    } catch (error) {
      console.error("Error placing the buy order:", error);
    }
  };

  const handleSellToken = async () => {
    try {
      const convertedSellAmount = sellAmount + "000000000000000000";
      const convertedSellPrice = sellPrice + "000000000000000000";
      console.log(
        `Placing sell order for ${sellAmount} tokens at ${sellPrice}$ each`
      );
      await marketContract.placeSellOrder(
        convertedSellAmount,
        convertedSellPrice,
        selectedToken.tokenAddress
      );
      console.log("Sell order placed successfully");
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
              justifyContent: "space-between",
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
                onClick={() => showModal(token, "buy")}
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
                onClick={() => showModal(token, "sell")}
                style={{
                  margin: "0 8px",
                  backgroundColor: "rgba(255, 0, 0, 0.1)",
                  color: "#FF6347",
                  border: "2px solid #FF6347",
                }}
              >
                Sell
              </Button>
              <Button
                type="link"
                style={{ margin: "0 8px", color: "white" }}
                onClick={() => window.open(token.docURL, "_blank")}
              >
                Documentation
              </Button>
              <Button
                onClick={() => approveToken(token.tokenAddress)}
                style={{
                  margin: "0 8px",
                  backgroundColor: "#FFA500",
                  color: "white",
                  border: "none",
                }}
              >
                Approve
              </Button>
            </div>
          </List.Item>
        )}
      />

      <Modal
        title={`Buy ${selectedToken?.name || ""}`}
        open={buyVisible}
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

      <Modal
        title={`Sell ${selectedToken?.name || ""}`}
        open={sellVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Quantity">
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter quantity"
              value={sellAmount !== 0 ? sellAmount : undefined}
              onChange={handleAmountChange}
            />
          </Form.Item>
          <Form.Item label="Price">
            <Input
              prefix="$USDT"
              placeholder="Enter price"
              value={sellPrice !== 0 ? sellPrice : undefined}
              onChange={handlePriceChange}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" block onClick={handleSellToken}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TokenList;
