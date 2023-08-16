import React, { useState } from "react";
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import addresses from "../../utils/addresses";
import SecurityTokenArtifact from "../../utils/SecurityToken.json";
import MarketArtifact from "../../utils/Market.json";
import { useMarket } from "../../utils/useMarket";
import { Form, Input, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styles from "./styles.module.css";


const Minter = () => {
  const { marketContract } = useMarket(addresses.Market, MarketArtifact.abi);

  const [formData, setFormData] = useState({
    tokenName: "",
    tokenSymbol: "",
    relatedAsset: "",
    documentationName: "",
    documentationLink: "",
  });
  const [isLoading, setIsLoading] = useState(false); // Para mostrar un spinner mientras se despliega el contrato

  const deployContract = async () => {
    try {
      setIsLoading(true);
      // Solicitar acceso a la cuenta de Metamask
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      // Conectar con Metamask
      const provider = new Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // ABI y bytecode
      const contractABI = SecurityTokenArtifact.abi;
      const contractBytecode = SecurityTokenArtifact.bytecode;

      // Crear una nueva instancia de contrato Factory
      const contractFactory = new ethers.ContractFactory(
        contractABI,
        contractBytecode,
        signer
      );

      // Desplegar el contrato con los valores del formulario
      const contract = await contractFactory.deploy(
        formData.tokenName,
        formData.tokenSymbol,
        formData.relatedAsset,
        formData.documentationName,
        formData.documentationLink
      );

      // Esperar a que se mine el contrato
      await contract.deployed();

      console.log("Contrato desplegado en:", contract.address);

      // Guardar address de token en contrato de mercado
      try {
        const tx = await marketContract.registerToken(
          contract.address,
          formData.tokenName,
          formData.tokenSymbol,
          formData.relatedAsset
        );
        await tx.wait();
        console.log("Token añadido al mercado");
      } catch (error) {
        console.error("Error añadiendo token al mercado:", error);
      }

    } catch (error) {
      console.error("Error desplegando el contrato:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onValuesChange = (changedValues, allValues) => {
    setFormData(allValues);
  };

  const onFinish = () => {
    console.log("Form Data:", formData);
    deployContract();
  };

  return (
    <div className={styles.container}>
      <Form
        name="token_form"
        initialValues={formData}
        onValuesChange={onValuesChange}
        onFinish={onFinish}
        labelWrap
        layout="vertical"
        colon={false}
      >
        <Form.Item
          className={styles.formItem}
          label="Token name"
          name="tokenName"
          rules={[
            {
              required: true,
              message: "Please enter token name!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label="Token symbol"
          name="tokenSymbol"
          rules={[
            {
              required: true,
              message: "Please enter token symbol!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label="Related asset"
          name="relatedAsset"
          rules={[
            {
              required: true,
              message: "Please enter related asset!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label="Asset documentation name"
          name="documentationName"
          rules={[
            {
              required: true,
              message: "Please provide documentation name!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          className={styles.formItem}
          label="Asset documentation URL"
          name="documentationLink"
          rules={[
            {
              required: true,
              message: "Please provide documentation URL!",
            },
            {
              type: "url",
              message: "Must be a valid URL!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item className={styles.formItem}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            style={{
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: "10px",
            }}
            icon={<PlusOutlined />}
          >
            Create and list token
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Minter;
